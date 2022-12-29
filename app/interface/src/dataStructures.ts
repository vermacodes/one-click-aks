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

interface Properteis {
  provisioningState: string;
}

interface ResoureceGroup {
  id: string;
  location: string;
  managedBy: string;
  name: string;
  properties: Properteis;
  tags: string;
  type: string;
}

export type ResoureceGroupType = ResoureceGroup;

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
  resourceGroup: ResoureceGroupType;
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

export type TfvarDefaultNodepoolType = {
  enableAutoScaling: boolean;
  minCount: number;
  maxCount: number;
};

export type TfvarKubernetesClusterType = {
  kubernetesVersion: string;
  networkPlugin: "azure" | "kubenet";
  networkPolicy: "azure" | "calico" | "null";
  outboundType: "loadBalancer" | "userDefinedRouting";
  privateClusterEnabled: "true" | "false";
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

export type TfvarConfigType = {
  resourceGroup: TfvarResourceGroupType;
  kubernetesCluster: TfvarKubernetesClusterType;
  virtualNetworks: TfvarVirtualNetworkType;
  subnets: TfvarSubnetType;
  networkSecurityGroups: TfvarNetworkSecurityGroupType[];
  jumpservers: TfvarJumpserverType;
  firewalls: TfvarFirewallType[];
  containerRegistries: TfvarContainerRegistryType[];
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
  isStreaming: boolean;
  logs: string;
};

export type TerraformWorkspace = {
  name: string;
  selected: boolean;
};

export type Preference = {
  azureRegion: string;
};

export type Lab = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  template: TfvarConfigType | undefined;
  extendScript: string;
  validateScript: string;
  message: string;
  type: string;
  createdby: string;
  createdon: string;
  updatedby: string;
  updatedon: string;
};

export type Assignment = {
  id: string;
  user: string;
  labId: string;
  labName: string;
  status: string;
};

export type Privildge = {
  user: string;
  isAdmin: boolean;
  isMentor: boolean;
};

export type KubernetesOrchestrators = {
  id: string;
  name: string;
  orchestrators: Orchestrator[];
  type: string;
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

export type ServerStatus = {
  status: "" | "OK";
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
  | "primary-outline-animate";
