import {
  Lab,
  ServerNotification,
  TerraformOperation,
  TfvarAddonsType,
  TfvarAppGatewayType,
  TfvarConfigType,
  TfvarContainerRegistryType,
  TfvarDefaultNodepoolType,
  TfvarFirewallType,
  TfvarKubernetesClusterType,
  TfvarServiceMeshType,
} from "./dataStructures";

const defaultFirewall: TfvarFirewallType = {
  skuName: "AZFW_VNet",
  skuTier: "Standard",
};
export function getDefaultFirewall(): TfvarFirewallType {
  return structuredClone(defaultFirewall);
}

const defaultContainerRegistry: TfvarContainerRegistryType = {};
export function getDefaultContainerRegistry(): TfvarContainerRegistryType {
  return structuredClone(defaultContainerRegistry);
}

const defaultAppGateways: TfvarAppGatewayType = {};
export function getDefaultAppGateways(): TfvarAppGatewayType {
  return structuredClone(defaultAppGateways);
}

const defaultServiceMesh: TfvarServiceMeshType = {
  enabled: false,
  mode: "Istio",
  internalIngressGatewayEnabled: false,
  externalIngressGatewayEnabled: false,
};
export function getDefaultServiceMesh(): TfvarServiceMeshType {
  return structuredClone(defaultServiceMesh);
}

const defaultAKSAddons: TfvarAddonsType = {
  appGateway: false,
  microsoftDefender: false,
  virtualNode: false,
  httpApplicationRouting: false,
  serviceMesh: defaultServiceMesh,
};
export function getDefaultAKSAddons(): TfvarAddonsType {
  return structuredClone(defaultAKSAddons);
}

const defaultNodePool: TfvarDefaultNodepoolType = {
  enableAutoScaling: false,
  minCount: 1,
  maxCount: 1,
};
export function getDefaultNodePool(): TfvarDefaultNodepoolType {
  return structuredClone(defaultNodePool);
}

const defaultKubernetesCluster: TfvarKubernetesClusterType = {
  kubernetesVersion: "",
  networkPlugin: "kubenet",
  networkPolicy: "null",
  networkPluginMode: "null",
  outboundType: "loadBalancer",
  privateClusterEnabled: "false",
  addons: defaultAKSAddons,
  defaultNodePool: defaultNodePool,
};

export function getDefaultKubernetesCluster(): TfvarKubernetesClusterType {
  return structuredClone(defaultKubernetesCluster);
}

const defaultTfvarConfig: TfvarConfigType = {
  resourceGroup: {
    location: "East US",
  },
  kubernetesClusters: [defaultKubernetesCluster],
  virtualNetworks: [
    {
      addressSpace: ["10.1.0.0/16"],
    },
  ],
  subnets: [
    {
      addressPrefixes: ["10.1.1.0/24"],
      name: "AzureFirewallSubnet",
    },
    {
      addressPrefixes: ["10.1.2.0/24"],
      name: "JumpServerSubnet",
    },
    {
      addressPrefixes: ["10.1.3.0/24"],
      name: "KubernetesSubnet",
    },
    {
      addressPrefixes: ["10.1.4.0/24"],
      name: "AppGatewaySubnet",
    },
    {
      addressPrefixes: ["10.1.5.0/24"],
      name: "AROMasterSubnet",
    },
    {
      addressPrefixes: ["10.1.6.0/24"],
      name: "AROWorkerSubnet",
    },
    {
      addressPrefixes: ["10.1.7.0/24"],
      name: "KubernetesVirtualNodeSubnet",
    },
  ],
  networkSecurityGroups: [{}],
  jumpservers: [
    {
      adminUsername: "aksadmin",
      adminPassword: "Password1234!",
    },
  ],
  firewalls: [],
  containerRegistries: [],
  appGateways: [],
};
export function getDefaultTfvarConfig(): TfvarConfigType {
  return structuredClone(defaultTfvarConfig);
}

const defaultLab: Lab = {
  id: "",
  name: "",
  description: "",
  tags: [""],
  category: "private",
  type: "privatelab",
  template: defaultTfvarConfig,
  extendScript: "",
  message: "",
  createdBy: "",
  updatedBy: "",
  createdOn: "",
  updatedOn: "",
  owners: [],
  editors: [],
  viewers: [],
  versionId: "",
  isCurrentVersion: true,
};
export function getDefaultLab(): Lab {
  return structuredClone(defaultLab);
}

const defaultTerraformOperation: TerraformOperation = {
  inProgress: false,
  operationId: "",
  status: "Deployment Not Started",
};
export function getDefaultTerraformOperation(): TerraformOperation {
  return structuredClone(defaultTerraformOperation);
}

const defaultServerNotification: ServerNotification = {
  id: "",
  message: "",
  type: "info",
  autoClose: 0,
};
export function getDefaultServerNotification(): ServerNotification {
  return structuredClone(defaultServerNotification);
}
