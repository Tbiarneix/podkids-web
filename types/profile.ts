import { AgeRange } from "./podcast";

export interface Profile {
  id: string;
  name: string;
  avatar: number;
  ageRanges: AgeRange[];
  activeProfile: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ProfileFormData {
  name: string;
  avatar: number;
  ageRanges: AgeRange[];
}
