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
    networkPlugin: string
}

export type ClusterConfigurationType = ClusterConfiguration