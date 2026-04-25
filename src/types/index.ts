export interface User {
  id: number;
  phoneNumber: string;
  role: 'STUDENT' | 'INSTITUTION' | 'TREASURY' | 'MINISTRY_OFFICER' | 'ADMIN';
  subCounty?: string; // only for TREASURY role
}

export interface Institution {
  id: number;
  name: string;
  category?: string;
  subCounty: { id: number; name: string };
  ward: { id: number; name: string };
}

export interface Course {
  id: number;
  name: string;
  level: string;
  category?: string;
  institution?: Institution;
}

export interface Application {
  id: number;
  student: {
    fullName: string;
    gender: string;
    disabilityStatus: string;
    subCounty: string;
    ward: string;
  };
  institution: Institution;
  course: Course;
  status: string;
  appliedAt: string;
  institutionRemarks: string | null;
  subCountyRemarks: string | null;
  facilitationAmount: number | null;
}