import { BaseApiClient } from "./base";
import {
  MeetingListItem,
  MeetingDetail,
  MyApplication,
  MeetingApplicationSummary,
} from "../types";

class MeetingsApiClient extends BaseApiClient {
  /**
   * 모임 목록 조회
   */
  async getMeetings(viewerId?: string): Promise<MeetingListItem[]> {
    const response = await this.api.get("/meetings", {
      params: viewerId ? { viewerId } : undefined,
    });
    return response.data;
  }

  /**
   * 모임 상세 조회
   */
  async getMeetingDetail(
    meetingId: number,
    viewerId?: string
  ): Promise<MeetingDetail> {
    const response = await this.api.get(`/meetings/${meetingId}`, {
      params: viewerId ? { viewerId } : undefined,
    });
    return response.data;
  }

  /**
   * 모임 신청
   */
  async applyToMeeting(
    meetingId: number,
    body: {
      applicantId: string;
      applicantName: string;
    }
  ): Promise<{
    success: boolean;
    message: string;
    applicationId: number;
    application: MeetingApplicationSummary;
  }> {
    const response = await this.api.post(
      `/meetings/${meetingId}/applications`,
      body
    );
    return response.data;
  }

  /**
   * 내 신청 결과 조회
   */
  async getViewerApplications(viewerId: string): Promise<MyApplication[]> {
    const response = await this.api.get("/viewer/applications", {
      params: { viewerId },
    });
    return response.data;
  }
}

export const meetingsApiClient = new MeetingsApiClient();
