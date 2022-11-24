import { TfvarConfigType, TfvarFirewallType } from "../../dataStructures";

export const defaultFirewall: TfvarFirewallType = {
    skuName: "AZFW_VNet",
    skuTier: "Standard",
};

export const defaultTfvarConfig: TfvarConfigType = {
    resourceGroup: {
        location: "East US",
    },
    kubernetesCluster: {
        networkPlugin: "azure",
        networkPolicy: "azure",
        outboundType: "loadBalancer",
        privateClusterEnabled: "true",
        defaultNodePool: {
            enableAutoScaling: true,
            minCount: 1,
            maxCount: 1,
        },
    },
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
    ],
    jumpservers: [
        {
            adminUsername: "aksadmin",
            adminPassword: "Password1234!",
        },
    ],
    firewalls: [],
};
