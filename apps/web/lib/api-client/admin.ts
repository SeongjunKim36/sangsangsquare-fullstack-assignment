import { BaseApiClient } from "./base";
import {
  AdminMeetingItem,
  Applicant,
  CreateMeetingForm,
  CreateMeetingResponse,
  UpdateApplicationStatusResponse,
} from "../types";

class AdminApiClient extends BaseApiClient {
  /**
   * 모임 생성
   */
  async createMeeting(body: CreateMeetingForm): Promise<CreateMeetingResponse> {
    const response = await this.api.post("/admin/meetings", body);
    return response.data;
  }

  /**
   * 관리자 모임 목록 조회
   */
  async getMeetings(): Promise<AdminMeetingItem[]> {
    const response = await this.api.get("/admin/meetings");
    return response.data;
  }

  /**
   * 모임 상세 정보 조회 (관리자용)
   */
  async getMeetingDetail(meetingId: number): Promise<AdminMeetingItem> {
    const response = await this.api.get(`/admin/meetings/${meetingId}`);
    return response.data;
  }

  /**
   * 모임 신청자 목록 조회
   */
  async getMeetingApplications(meetingId: number): Promise<Applicant[]> {
    const response = await this.api.get(
      `/admin/meetings/${meetingId}/applications`
    );
    return response.data;
  }

  /**
   * 신청자 상태 변경 (선정/탈락)
   */
  async updateApplicationStatus(
    applicationId: number,
    status: "SELECTED" | "REJECTED"
  ): Promise<UpdateApplicationStatusResponse> {
    const response = await this.api.patch(
      `/admin/applications/${applicationId}/status`,
      { status }
    );
    return response.data;
  }
}

export const adminApiClient = new AdminApiClient();
