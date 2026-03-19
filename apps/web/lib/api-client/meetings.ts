import { BaseApiClient } from "./base";
import { MeetingListItem, MeetingDetail, MyApplication, MeetingApplicationSummary } from "../types";

class MeetingsApiClient extends BaseApiClient {
  /**
   * 모임 목록 조회
   */
  async getMeetings(): Promise<MeetingListItem[]> {
    const response = await this.api.get("/meetings");
    return response.data;
  }

  /**
   * 모임 상세 조회
   */
  async getMeetingDetail(meetingId: number): Promise<MeetingDetail> {
    const response = await this.api.get(`/meetings/${meetingId}`);
    return response.data;
  }

  /**
   * 모임 신청
   */
  async applyToMeeting(meetingId: number): Promise<{
    success: boolean;
    message: string;
    applicationId: number;
    application: MeetingApplicationSummary;
  }> {
    const response = await this.api.post(`/meetings/${meetingId}/applications`);
    return response.data;
  }

  /**
   * 내 신청 결과 조회
   */
  async getMyApplications(): Promise<MyApplication[]> {
    const response = await this.api.get("/me/applications");
    return response.data;
  }
}

export const meetingsApiClient = new MeetingsApiClient();
