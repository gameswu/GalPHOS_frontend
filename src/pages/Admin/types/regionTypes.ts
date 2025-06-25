export interface Province {
  id: string;
  name: string;
  schools: School[];
  createdAt: string;
  updatedAt: string;
}

export interface School {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegionFormData {
  provinceName: string;
  schoolName: string;
}