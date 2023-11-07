package entity

// Terraform workspace.
// Terraform workspace has a name and its selected or not.
// There is always a 'default' workspace and is selected by default.
type Workspace struct {
	Name     string `json:"name"`
	Selected bool   `json:"selected"`
}

type WorkspaceService interface {
	List() ([]Workspace, error)
	GetSelectedWorkspace() (Workspace, error)

	//Following mutating operations delete resources from redis.
	Add(Workspace) error
	Select(Workspace) error
	Delete(Workspace) error

	// Resources of selected workspace
	Resources() (string, error)

	// Invalidate Cache
	DeleteAllWorkspaceFromRedis() error
}

// Implements Terraform Repository
// All the operations are done using a script or bash commands.
// Persistence of this is take care of by terraform itself.
type WorkspaceRepository interface {
	// List all the workspaces. Workspaces is the output sent in string.
	List(storageAccountName string) (string, error)

	GetListFromRedis() (string, error)
	AddListToRedis(val string)

	// All mutating operations on workspaces must delete list from redis.
	DeleteListFromRedis()

	// As a new workspace is added, it becomes the selected workspace.
	// Thats a terraform feature.
	// Client is expected to run List query after update is made.
	Add(Workspace) error

	// Selects the workspace.
	Select(Workspace) error

	// Deletes the workspace.
	Delete(Workspace) error

	// Gets the resources in current selected workspace.
	// The Resources are just a string and thus returned as is.
	Resources(StorageAccount string) (string, error)

	GetResourcesFromRedis() (string, error)
	AddResourcesToRedis(val string)

	// This is used to delete resources from redis.
	// All mutating terraform operations must delete resources
	// from redis to ensure fresh data.
	DeleteResourcesFromRedis()
}
