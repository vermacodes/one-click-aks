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

export type TfvarDefaultNodepoolType = {
  enableAutoScaling: boolean;
  minCount: number;
  maxCount: number;
};

export type TfvarKubernetesClusterType = {
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

interface TfvarConfig {
  resourceGroup: TfvarResourceGroupType;
  kubernetesCluster: TfvarKubernetesClusterType;
  virtualNetworks: TfvarVirtualNetworkType;
  subnets: TfvarSubnetType;
  jumpservers: TfvarJumpserverType;
  firewalls: TfvarFirewallType[];
}

export type TfvarConfigType = TfvarConfig;

export type BlobType = {
  name: string;
  url: string;
};

export type LabType = {
  name: string;
  tfvar: TfvarConfigType;
  breakScript: string;
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
