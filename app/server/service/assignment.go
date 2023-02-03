package service

import (
	"encoding/json"
	"strings"

	"github.com/vermacodes/one-click-aks/app/server/entity"
	"github.com/vermacodes/one-click-aks/app/server/helper"
	"golang.org/x/exp/slog"
)

type assignmentService struct {
	assignmentRepository entity.AssignmentRepository
	authService          entity.AuthService
	labService           entity.LabService
}

func NewAssignmentService(assignmentRepository entity.AssignmentRepository, authService entity.AuthService, labService entity.LabService) entity.AssignmentService {
	return &assignmentService{
		assignmentRepository: assignmentRepository,
		authService:          authService,
		labService:           labService,
	}
}

func (a *assignmentService) GetAssignments() ([]entity.Assigment, error) {
	assignments := []entity.Assigment{}

	ar, err := a.assignmentRepository.GetEnumerationResults()
	if err != nil {
		slog.Error("not able to list assignments", err)
		return assignments, err
	}

	for _, element := range ar.Blobs.Blob {
		assignment, err := a.assignmentRepository.GetAssignment(element.Name)
		if err != nil {
			slog.Error("not able to get assignmet "+assignment.Id, err)
			continue
		}
		assignments = append(assignments, assignment)
	}

	return assignments, nil
}

func (a *assignmentService) GetMyAssignments() ([]entity.LabType, error) {
	assignedLabs := []entity.LabType{}

	account, err := a.authService.GetAccount()
	if err != nil {
		slog.Error("not able to get account", err)
		return assignedLabs, err
	}

	assignments, err := a.GetAssignments()
	if err != nil {
		slog.Error("not able to get assignments", err)
		return assignedLabs, err
	}

	labs, err := a.labService.GetPublicLabs("labexercises")
	if err != nil {
		slog.Error("not able to get lab exercises", err)
		return assignedLabs, err
	}

	for _, assignment := range assignments {
		slog.Info("Assignment ID : " + assignment.Id)
		for _, lab := range labs {
			slog.Info("Lab ID : " + lab.Name)
			if assignment.LabId == lab.Id {
				if assignment.User == account.User.Name {
					lab.ExtendScript = "redacted"
					assignedLabs = append(assignedLabs, lab)
					break
				}
			}
		}
	}

	return assignedLabs, nil
}

func (a *assignmentService) CreateAssignment(assignment entity.Assigment) error {
	// Gnerate Assignmetn ID
	if assignment.Id == "" {
		assignment.Id = helper.Generate(20)
	}

	if !strings.Contains("@microsoft.com", assignment.User) {
		assignment.User = assignment.User + "@microsoft.com"
	}

	assignments, err := a.GetAssignments()
	if err != nil {
		slog.Error("not able to list existing assingments", err)
		return err
	}

	for _, element := range assignments {
		if element.User == assignment.User && element.LabId == assignment.LabId {
			slog.Info("assignment already exits")
			return nil
		}
	}

	val, err := json.Marshal(assignment)
	if err != nil {
		slog.Error("not able to convert assignment object to string", err)
		return err
	}

	if err := a.assignmentRepository.CreateAssignment(assignment.Id, string(val)); err != nil {
		slog.Error("not able to create assignment", err)
		return err
	}

	return nil
}

func (a *assignmentService) DeleteAssignment(assignment entity.Assigment) error {
	if err := a.assignmentRepository.DeleteAssignment(assignment.Id); err != nil {
		slog.Error("not able to delete assingment with id "+assignment.Id, err)
		return err
	}
	return nil
}
