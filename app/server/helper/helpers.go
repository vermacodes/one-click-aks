package helper

import (
	"context"
	"crypto/rand"
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"strings"
	"time"
	"unicode"
	"unsafe"

	"github.com/Azure/azure-sdk-for-go/sdk/data/aztables"
	"github.com/golang-jwt/jwt"
	"github.com/lestrrat-go/jwx/jwa"
	"github.com/lestrrat-go/jwx/jwk"
	"github.com/vermacodes/one-click-aks/app/server/entity"
	"golang.org/x/exp/slog"
)

var alphabet = []byte("abcdefghijklmnopqrstuvwxyz0123456789")

func Generate(size int) string {
	b := make([]byte, size)
	rand.Read(b)
	for i := 0; i < size; i++ {
		b[i] = alphabet[b[i]%byte(len(alphabet))]
	}
	return *(*string)(unsafe.Pointer(&b))
}

func CamelToConventional(s string) string {
	var result []rune
	var runes = []rune(s)
	for i := 0; i < len(runes); i++ {
		if i > 0 && unicode.IsUpper(runes[i]) && ((i+1 < len(runes) && unicode.IsLower(runes[i+1])) || unicode.IsLower(runes[i-1])) {
			result = append(result, '_')
		}
		result = append(result, unicode.ToLower(runes[i]))
	}
	return string(result)
}

func GetUserPrincipalFromMSALAuthToken(token string) (string, error) {

	// Split the token into its parts
	tokenParts := strings.Split(token, ".")
	if len(tokenParts) < 2 {
		err := errors.New("invalid token format")
		slog.Error("invalid token format", err)
		return "", err
	}

	// Decode the token
	decodedToken, err := base64.StdEncoding.DecodeString(tokenParts[1] + strings.Repeat("=", (4-len(tokenParts[1])%4)%4))
	if err != nil {
		slog.Error("not able to decode token -> ", err)
		return "", err
	}

	// Extract the user principal name from the decoded token
	var tokenJSON map[string]interface{}
	err = json.Unmarshal(decodedToken, &tokenJSON)
	if err != nil {
		slog.Error("not able to unmarshal token -> ", err)
		return "", err
	}

	userPrincipal, ok := tokenJSON["upn"].(string)
	if !ok {
		err := errors.New("user principal name not found in token")
		slog.Error("user principal name not found in token", err)
		return "", err
	}

	return userPrincipal, nil
}

func VerifyToken(tokenString string) (bool, error) {

	// Drop the Bearer prefix if it exists
	if strings.HasPrefix(tokenString, "Bearer ") {
		tokenString = strings.Split(tokenString, "Bearer ")[1]
	}

	keySet, err := jwk.Fetch(context.TODO(), "https://login.microsoftonline.com/common/discovery/v2.0/keys")

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if token.Method.Alg() != jwa.RS256.String() {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		kid, ok := token.Header["kid"].(string)
		if !ok {
			return nil, fmt.Errorf("kid header not found")
		}

		keys, ok := keySet.LookupKeyID(kid)
		if !ok {
			return nil, fmt.Errorf("key %v not found", kid)
		}

		publicKey := &rsa.PublicKey{}
		err = keys.Raw(publicKey)
		if err != nil {
			return nil, fmt.Errorf("failed to parse public key")
		}

		return publicKey, nil
	})

	if err != nil {
		return false, err
	}

	if !token.Valid {
		err := errors.New("token is not valid")
		slog.Error("token is not valid", err)
		return false, err
	}

	// Get the claims from the token
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return false, errors.New("invalid claims")
	}

	// check the audience
	aud, ok := claims["aud"].(string)
	if !ok {
		return false, errors.New("not able to get audience from claims")
	}
	if aud != os.Getenv("AUTH_TOKEN_AUD") {
		return false, errors.New("unexpected audience, expected " + os.Getenv("AUTH_TOKEN_AUD") + " but got " + aud)
	}

	// Check the issuer
	iss, ok := claims["iss"].(string)
	if !ok {
		return false, errors.New("not able to get issuer from claims")
	}
	if iss != os.Getenv("AUTH_TOKEN_ISS") {
		return false, errors.New("unexpected issuer, expected " + os.Getenv("AUTH_TOKEN_ISS") + " but got " + iss)
	}

	// Check the expiration time
	exp, ok := claims["exp"].(float64)
	if !ok {
		return false, errors.New("invalid expiration time")
	}
	if time.Now().Unix() > int64(exp) {
		return false, errors.New("token has expired")
	}

	return true, nil

}

func GetServiceClient() *aztables.ServiceClient {

	SasUrl := "https://" + entity.StorageAccountName + ".table.core.windows.net/" + entity.SasToken
	serviceClient, err := aztables.NewServiceClientWithNoCredential(SasUrl, nil)
	if err != nil {
		slog.Error("error get client", err)
	}

	return serviceClient
}

// CalculateNewEpochTimeForDeployment updates the deployment's destroy time in place.
func CalculateNewEpochTimeForDeployment(deployment *entity.Deployment) {
	if !deployment.DeploymentAutoDelete {
		deployment.DeploymentAutoDeleteUnixTime = 0
	} else {
		now := time.Now()
		// Get epoch time in seconds
		epochTime := now.Unix()
		deployment.DeploymentAutoDeleteUnixTime = deployment.DeploymentLifespan + epochTime
	}
}
