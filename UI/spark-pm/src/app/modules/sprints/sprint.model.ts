// Sprint interfaces for data modeling
export interface Sprint {
  id?: number;
  sprintName: string;
  noOfHolidays: number;
  fromDate: string;
  toDate: string;
  tramId: number;
  sprintPoint: number;
  sprintArchive?: number;
  detailsRemark?: string;
  createBy?: string;
  createTime?: string;
  status: number;
  comments?: string;
  sprintOutcome?: string;
}

export interface SprintFormData {
  sprintName: string;
  noOfHolidays: number;
  fromDate: string;
  toDate: string;
  tramId: number;
  sprintPoint: number;
  detailsRemark?: string;
  status: number;
  comments?: string;
  sprintOutcome?: string;
}
