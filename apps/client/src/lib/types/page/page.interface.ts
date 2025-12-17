export interface IPage {
  _id: string;
  userId: string;
  organizationId: string;
  title: string;
  slug: string;
  pageData: Record<string, any>;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}
