import { TypeOptions } from "react-toastify";

interface User {
  name: string;
  type: string;
}

export type UserType = User;

interface Tenant {
  tenantId: string;
}

export type TenantType = Tenant[];

export type AccountType = {
  environmentName: string;
  homeTenantId: string;
  id: string;
  isDefault: boolean;
  managedByTenants: TenantType;
  name: string;
  state: string;
  tenantId: string;
  user: UserType;
};

interface Properties {
  provisioningState: string;
}

interface ResourceGroup {
  id: string;
  location: string;
  managedBy: string;
  name: string;
  properties: Properties;
  tags: string;
  type: string;
}

export type ResourceGroupType = ResourceGroup;

interface StorageAccount {
  id: string;
  name: string;
}

export type StorageAccountType = StorageAccount;

interface BlobContainer {
  name: string;
}

export type BlobContainerType = BlobContainer;

interface StateConfiguration {
  resourceGroup: ResourceGroupType;
  storageAccount: StorageAccountType;
  blobContainer: BlobContainerType;
}

export type StateConfigurationType = StateConfiguration;

interface StateConfigurationStatus {
  isStateConfigured: boolean;
}

export type StateConfigurationStatusType = StateConfigurationStatus;

interface ClusterConfiguration {
  networkPlugin: "azure" | "kubenet";
  networkPolicy: "azure" | "calico" | "null";
}

export type ClusterConfigurationType = ClusterConfiguration;

interface tfvarResourceGroup {
  location: string;
}

export type TfvarResourceGroupType = tfvarResourceGroup;

interface tfvarVirtualNetwork {
  addressSpace: string[];
}

export type TfvarVirtualNetworkType = tfvarVirtualNetwork[];

interface tfvarSubnet {
  name: string;
  addressPrefixes: string[];
}

export type TfvarSubnetType = tfvarSubnet[];

export type TfvarNetworkSecurityGroupType = {};

export type TfvarServiceMeshType = {
  enabled: boolean;
  mode: "Istio";
  internalIngressGatewayEnabled: boolean;
  externalIngressGatewayEnabled: boolean;
};

export type TfvarAddonsType = {
  appGateway: boolean;
  microsoftDefender: boolean;
  virtualNode: boolean;
  httpApplicationRouting: boolean;
  serviceMesh: TfvarServiceMeshType;
};

export type TfvarDefaultNodepoolType = {
  enableAutoScaling: boolean;
  minCount: number;
  maxCount: number;
};

export type TfvarKubernetesClusterType = {
  kubernetesVersion: string;
  networkPlugin: "azure" | "kubenet";
  networkPolicy: "azure" | "calico" | "null";
  networkPluginMode: "Overlay" | "null";
  outboundType: "loadBalancer" | "userDefinedRouting";
  privateClusterEnabled: "true" | "false";
  addons: TfvarAddonsType;
  defaultNodePool: TfvarDefaultNodepoolType;
};

interface tfvarJumpserver {
  adminUsername: string;
  adminPassword: string;
}

export type TfvarJumpserverType = tfvarJumpserver[];

export type TfvarFirewallType = {
  skuName: string;
  skuTier: string;
};

export type TfvarContainerRegistryType = {};

export type TfvarAppGatewayType = {};

export type TfvarConfigType = {
  resourceGroup: TfvarResourceGroupType;
  kubernetesClusters: TfvarKubernetesClusterType[];
  virtualNetworks: TfvarVirtualNetworkType;
  subnets: TfvarSubnetType;
  networkSecurityGroups: TfvarNetworkSecurityGroupType[];
  jumpservers: TfvarJumpserverType;
  firewalls: TfvarFirewallType[];
  containerRegistries: TfvarContainerRegistryType[];
  appGateways: TfvarAppGatewayType[];
};

export type BlobType = {
  name: string;
  url: string;
};

export type LabType = {
  name: string;
  tfvar: TfvarConfigType;
  extendScript: string;
  validateScript: string;
};

export type ActionStatusType = {
  inProgress: boolean;
};

export type LogsStreamType = {
  logs: string;
};

export type TerraformWorkspace = {
  name: string;
  selected: boolean;
};

export type Preference = {
  azureRegion: string;
  terminalAutoScroll: boolean;
};

export type Lab = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  template: TfvarConfigType | undefined;
  extendScript: string;
  message: string;
  type:
    | "template"
    | "sharedtemplate"
    | "labexercise"
    | "assignment"
    | "mockcase";
  createdBy: string;
  createdOn: string;
  updatedBy: string;
  updatedOn: string;
};

export type Assignment = {
  id: string;
  user: string;
  labId: string;
  labName: string;
  status: string;
};

export type Privilege = {
  user: string;
  isAdmin: boolean;
  isMentor: boolean;
};

// export type KubernetesOrchestrators = {
//   id: string;
//   name: string;
//   orchestrators: Orchestrator[];
//   type: string;
// };

export type KubernetesOrchestrators = {
  values: Value[];
};

export type Orchestrator = {
  default: boolean | null;
  isPreview: boolean | null;
  orchestratorType: OrchestratorType;
  orchestratorVersion: string;
  upgrades: Upgrade[] | null;
};

export type OrchestratorType = {
  Kubernetes: "Kubernetes";
};

export type Upgrade = {
  isPreview: boolean | null;
  orchestratorType: OrchestratorType;
  orchestratorVersion: string;
};

export type PatchVersions = {
  [key: string]: {
    upgrades: string[];
  };
};

export type Capabilities = {
  SupportPlan: string[];
};

export type Value = {
  capabilities: Capabilities;
  isPreview: boolean | null;
  patchVersions: PatchVersions;
  version: string;
};

export type ServerStatus = {
  status: "" | "OK";
  version: string;
};

export type LoginStatus = {
  isLoggedIn: boolean;
};

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "success"
  | "primary-outline"
  | "secondary-outline"
  | "danger-outline"
  | "success-outline"
  | "primary-outline-animate"
  | "primary-text"
  | "secondary-text"
  | "danger-text"
  | "success-text"
  | "primary-icon"
  | "secondary-icon"
  | "text";

export type ButtonContainerObj = {
  id: string;
  order: number;
  button: React.ReactNode;
};

export type Roles = {
  userPrincipal: string;
  roles: string[];
};

export type RoleMutation = {
  userPrincipal: string;
  role: string;
};

export type GraphData = {
  businessPhones: string[];
  displayName: string;
  givenName: string;
  jobTitle: string;
  mail: string;
  mobilePhone: string;
  officeLocation: string;
  preferredLanguage: string;
  surname: string;
  userPrincipalName: string;
  id: string;
};

export type DeploymentStatus =
  | "Init In Progress"
  | "Init Failed"
  | "Init Completed"
  | "Plan In Progress"
  | "Plan Failed"
  | "Plan Completed"
  | "Deployment In Progress"
  | "Deployment Failed"
  | "Deployment Completed"
  | "Deployment Not Started"
  | "Destroy In Progress"
  | "Destroy Completed"
  | "Destroy Failed";

export type DeploymentType = {
  deploymentId: string;
  deploymentUserId: string;
  deploymentWorkspace: string;
  deploymentSubscriptionId: string;
  deploymentStatus: DeploymentStatus;
  deploymentLab: Lab;
  deploymentAutoDelete: boolean;
  deploymentLifespan: number;
  deploymentAutoDeleteUnixTime: number;
};

export type TerraformOperation = {
  operationId: string;
  inProgress: boolean;
  status: DeploymentStatus;
};

export type ServerNotification = {
  id: string;
  type: TypeOptions;
  message: string;
  autoClose: number;
};
