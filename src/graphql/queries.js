/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getPds = /* GraphQL */ `
  query GetPds($id: ID!) {
    getPDS(id: $id) {
      id
      healthcare_id
      data_type_detail
      base_date
      data_owner
      data_summary
      data_type
      detail_datas {
        data_name
        data_type
        url
      }
      updatedAt
      createdAt
    }
  }
`;
export const listPdSs = /* GraphQL */ `
  query ListPdSs(
    $filter: ModelPDSFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPDSs(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        healthcare_id
        data_type_detail
        base_date
        data_owner
        data_summary
        data_type
        detail_datas {
          data_name
          data_type
          url
        }
        updatedAt
        createdAt
      }
      nextToken
    }
  }
`;
export const ownerQueryByBaseDate = /* GraphQL */ `
  query OwnerQueryByBaseDate(
    $data_owner: String
    $base_date: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelPDSFilterInput
    $limit: Int
    $nextToken: String
  ) {
    ownerQueryByBaseDate(
      data_owner: $data_owner
      base_date: $base_date
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        healthcare_id
        data_type_detail
        base_date
        data_owner
        data_summary
        data_type
        detail_datas {
          data_name
          data_type
          url
        }
        updatedAt
        createdAt
      }
      nextToken
    }
  }
`;
export const ownerQueryByDataSummary = /* GraphQL */ `
  query OwnerQueryByDataSummary(
    $data_owner: String
    $data_summary: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelPDSFilterInput
    $limit: Int
    $nextToken: String
  ) {
    ownerQueryByDataSummary(
      data_owner: $data_owner
      data_summary: $data_summary
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        healthcare_id
        data_type_detail
        base_date
        data_owner
        data_summary
        data_type
        detail_datas {
          data_name
          data_type
          url
        }
        updatedAt
        createdAt
      }
      nextToken
    }
  }
`;
export const ownerQueryByDataTypeDetail = /* GraphQL */ `
  query OwnerQueryByDataTypeDetail(
    $data_owner: String
    $data_type_detail: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelPDSFilterInput
    $limit: Int
    $nextToken: String
  ) {
    ownerQueryByDataTypeDetail(
      data_owner: $data_owner
      data_type_detail: $data_type_detail
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        healthcare_id
        data_type_detail
        base_date
        data_owner
        data_summary
        data_type
        detail_datas {
          data_name
          data_type
          url
        }
        updatedAt
        createdAt
      }
      nextToken
    }
  }
`;
export const ownerQueryByUpdateAt = /* GraphQL */ `
  query OwnerQueryByUpdateAt(
    $data_owner: String
    $updatedAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelPDSFilterInput
    $limit: Int
    $nextToken: String
  ) {
    ownerQueryByUpdateAt(
      data_owner: $data_owner
      updatedAt: $updatedAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        healthcare_id
        data_type_detail
        base_date
        data_owner
        data_summary
        data_type
        detail_datas {
          data_name
          data_type
          url
        }
        updatedAt
        createdAt
      }
      nextToken
    }
  }
`;
export const memberQueryByDataTypeDetail = /* GraphQL */ `
  query MemberQueryByDataTypeDetail(
    $healthcare_id: String
    $data_type_detail: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelPDSFilterInput
    $limit: Int
    $nextToken: String
  ) {
    memberQueryByDataTypeDetail(
      healthcare_id: $healthcare_id
      data_type_detail: $data_type_detail
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        healthcare_id
        data_type_detail
        base_date
        data_owner
        data_summary
        data_type
        detail_datas {
          data_name
          data_type
          url
        }
        updatedAt
        createdAt
      }
      nextToken
    }
  }
`;
export const memberQueryByDataOwner = /* GraphQL */ `
  query MemberQueryByDataOwner(
    $healthcare_id: String
    $data_owner: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelPDSFilterInput
    $limit: Int
    $nextToken: String
  ) {
    memberQueryByDataOwner(
      healthcare_id: $healthcare_id
      data_owner: $data_owner
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        healthcare_id
        data_type_detail
        base_date
        data_owner
        data_summary
        data_type
        detail_datas {
          data_name
          data_type
          url
        }
        updatedAt
        createdAt
      }
      nextToken
    }
  }
`;
export const memberQueryByBaseDate = /* GraphQL */ `
  query MemberQueryByBaseDate(
    $healthcare_id: String
    $base_date: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelPDSFilterInput
    $limit: Int
    $nextToken: String
  ) {
    memberQueryByBaseDate(
      healthcare_id: $healthcare_id
      base_date: $base_date
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        healthcare_id
        data_type_detail
        base_date
        data_owner
        data_summary
        data_type
        detail_datas {
          data_name
          data_type
          url
        }
        updatedAt
        createdAt
      }
      nextToken
    }
  }
`;
export const memberQueryByUpdatedAt = /* GraphQL */ `
  query MemberQueryByUpdatedAt(
    $healthcare_id: String
    $updatedAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelPDSFilterInput
    $limit: Int
    $nextToken: String
  ) {
    memberQueryByUpdatedAt(
      healthcare_id: $healthcare_id
      updatedAt: $updatedAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        healthcare_id
        data_type_detail
        base_date
        data_owner
        data_summary
        data_type
        detail_datas {
          data_name
          data_type
          url
        }
        updatedAt
        createdAt
      }
      nextToken
    }
  }
`;
export const memberQueryByDataSummary = /* GraphQL */ `
  query MemberQueryByDataSummary(
    $healthcare_id: String
    $data_summary: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelPDSFilterInput
    $limit: Int
    $nextToken: String
  ) {
    memberQueryByDataSummary(
      healthcare_id: $healthcare_id
      data_summary: $data_summary
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        healthcare_id
        data_type_detail
        base_date
        data_owner
        data_summary
        data_type
        detail_datas {
          data_name
          data_type
          url
        }
        updatedAt
        createdAt
      }
      nextToken
    }
  }
`;
