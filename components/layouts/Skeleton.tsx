"use client";

import { Skeleton, Card, Space } from "antd";

export default function SkeletonLoad() {
  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Space orientation="vertical" style={{ width: "100%" }}>
          <Skeleton.Input active style={{ width: 200 }} />
          <Skeleton.Input active block />
          <Skeleton.Input active block />
          <Skeleton.Input active style={{ width: "50%" }} />
        </Space>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Skeleton active paragraph={{ rows: 5 }} />
      </Card>
    </div>
  );
}