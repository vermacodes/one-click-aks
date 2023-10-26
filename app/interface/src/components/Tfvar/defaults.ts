import {
  TfvarAddonsType,
  TfvarAppGatewayType,
  TfvarConfigType,
  TfvarContainerRegistryType,
  TfvarDefaultNodepoolType,
  TfvarFirewallType,
  TfvarKubernetesClusterType,
} from "../../dataStructures";

export const defaultFirewall: TfvarFirewallType = {
  skuName: "AZFW_VNet",
  skuTier: "Standard",
};

export const defaultContainerRegistry: TfvarContainerRegistryType = {};

export const defaultAppGateways: TfvarAppGatewayType = {};

export const defaultAKSAddons: TfvarAddonsType = {
  appGateway: false,
  microsoftDefender: false,
  virtualNode: false,
  httpApplicationRouting: false,
};

export const defaultNodePool: TfvarDefaultNodepoolType = {
  enableAutoScaling: true,
  minCount: 1,
  maxCount: 1,
};

export const defaultKubernetesCluster: TfvarKubernetesClusterType = {
  kubernetesVersion: "",
  networkPlugin: "azure",
  networkPolicy: "azure",
  networkPluginMode: "null",
  outboundType: "loadBalancer",
  privateClusterEnabled: "true",
  addons: defaultAKSAddons,
  defaultNodePool: defaultNodePool
};

export const defaultTfvarConfig: TfvarConfigType = {
  resourceGroup: {
    location: "East US",
  },
  kubernetesClusters: [
    {
      kubernetesVersion: "",
      networkPlugin: "kubenet",
      networkPolicy: "null",
      networkPluginMode: "null",
      outboundType: "loadBalancer",
      privateClusterEnabled: "false",
      addons: {
        appGateway: false,
        microsoftDefender: false,
        virtualNode: false,
        httpApplicationRouting: false,
      },
      defaultNodePool: {
        enableAutoScaling: false,
        minCount: 1,
        maxCount: 1,
      },
    },
  ],
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
