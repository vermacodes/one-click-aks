import {
  TfvarAppGatewayType,
  TfvarConfigType,
  TfvarContainerRegistryType,
  TfvarFirewallType,
} from "../../dataStructures";

export const defaultFirewall: TfvarFirewallType = {
  skuName: "AZFW_VNet",
  skuTier: "Standard",
};

export const defaultContainerRegistry: TfvarContainerRegistryType = {};

export const defaultAppGateways: TfvarAppGatewayType = {};

export const defautlKubernetesCluster = {
  kubernetesVersion: "",
  networkPlugin: "azure",
  networkPolicy: "azure",
  networkPluginMode: "null",
  outboundType: "loadBalancer",
  privateClusterEnabled: "true",
  addons: {
    appGateway: false,
    microsoftDefender: false,
  },
  defaultNodePool: {
    enableAutoScaling: true,
    minCount: 1,
    maxCount: 1,
  },
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
