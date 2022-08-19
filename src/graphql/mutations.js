/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createPds = /* GraphQL */ `
  mutation CreatePds(
    $input: CreatePDSInput!
    $condition: ModelPDSConditionInput
  ) {
    createPDS(input: $input, condition: $condition) {
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
export const updatePds = /* GraphQL */ `
  mutation UpdatePds(
    $input: UpdatePDSInput!
    $condition: ModelPDSConditionInput
  ) {
    updatePDS(input: $input, condition: $condition) {
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
export const deletePds = /* GraphQL */ `
  mutation DeletePds(
    $input: DeletePDSInput!
    $condition: ModelPDSConditionInput
  ) {
    deletePDS(input: $input, condition: $condition) {
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
