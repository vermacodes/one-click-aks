interface User {
    name: string
    type: string
}

export type UserType = User

interface Tenant {
    tenantId: string
}

export type TenantType = Tenant[]

interface Account {
    environmentName: string
    homeTenantId: string
    id: string
    isDefault: string
    managedByTenants: TenantType
    name: string
    state: string
    tenantId: string
    user: UserType
}

export type AccountType = Account


interface Properteis {
    provisioningState: string
}

interface ResoureceGroup {
    id: string
    location: string
    managedBy: string
    name: string
    properties: Properteis
    tags: string
    type: string
}

export type ResoureceGroupType = ResoureceGroup

interface StorageAccount {
    id: string
    name: string
}

export type StorageAccountType = StorageAccount

interface BlobContainer {
    name: string
}

export type BlobContainerType = BlobContainer

interface StateConfiguration {
    resourceGroup: ResoureceGroupType
    storageAccount: StorageAccountType
    blobContainer: BlobContainerType
}

export type StateConfigurationType = StateConfiguration

interface StateConfigurationStatus {
    isStateConfigured: boolean
}

export type StateConfigurationStatusType = StateConfigurationStatus

interface ClusterConfiguration {
    networkPlugin: 'azure' | 'kubenet',
    networkPolicy: 'azure' | 'calico' | 'null'
}

export type ClusterConfigurationType = ClusterConfiguration


interface tfvarResourceGroup {
    location: string
}

export type TfvarResourceGroupType = tfvarResourceGroup

interface tfvarVirtualNetwork {
    addressSpace: string[]
}

export type TfvarVirtualNetworkType = tfvarVirtualNetwork[]

interface tfvarSubnet {
    name: string
    addressPrefixes: string[]
}

export type TfvarSubnetType = tfvarSubnet[]

interface tfvarKubernetesCluster {
    networkPlugin: 'azure' | 'kubenet',
    networkPolicy: 'azure' | 'calico' | 'null'
    privateClusterEnabled: 'true' | 'false'
}

export type TfvarKubernetesClusterType = tfvarKubernetesCluster

interface tfvarJumpserver {
    adminUsername: string
    adminPassword: string
}

export type TfvarJumpserverType = tfvarJumpserver[]

interface TfvarConfig {
    resourceGroup: TfvarResourceGroupType
    kubernetesCluster: TfvarKubernetesClusterType
    virtualNetworks: TfvarVirtualNetworkType
    subnets: TfvarSubnetType
    jumpservers: TfvarJumpserverType
}

export type TfvarConfigType = TfvarConfig


interface blob {
    name: string
    url: string
}

export type BlobType = blob

export type LabType = {
    name: string
    tfvar: TfvarConfigType
    breakScript: string
    validateScript: string
}