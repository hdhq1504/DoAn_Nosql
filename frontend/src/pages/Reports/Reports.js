import React, { useState } from "react";
import {
  Table,
  Button,
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Tag,
  Progress,
} from "antd";
import {
  DownloadOutlined,
  TrophyOutlined,
  TeamOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import { mockReports } from "../../data/mockData";
import "./Reports.css";
import * as XLSX from "xlsx";

const { Title } = Typography;

export default function Reports() {
  const [reports] = useState(mockReports);

  // Statistics
  const stats = {
    totalEmployees: reports.length,
    avgKPI: Math.round(
      reports.reduce((sum, r) => sum + r.kpi, 0) / reports.length
    ),
    topPerformers: reports.filter((r) => r.kpi >= 100).length,
    totalRevenue: reports.reduce((sum, r) => sum + (r.revenue || 0), 0),
  };

  const getKPIColor = (kpi) => {
    if (kpi >= 100) return "#52c41a";
    if (kpi >= 90) return "#1890ff";
    if (kpi >= 80) return "#13c2c2";
    if (kpi >= 70) return "#faad14";
    if (kpi >= 60) return "#fa8c16";
    return "#ff4d4f";
  };

  const getKPITag = (kpi) => {
    let color = "default";
    if (kpi >= 100) color = "success";
    else if (kpi >= 90) color = "processing";
    else if (kpi >= 70) color = "warning";
    else color = "error";

    return <Tag color={color}>{kpi}%</Tag>;
  };

  const columns = [
    {
      title: "Tên nhân viên",
      dataIndex: "employeeName",
      key: "employeeName",
      width: 180,
      fixed: "left",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Phòng ban",
      dataIndex: "department",
      key: "department",
      width: 150,
    },
    {
      title: "Hợp đồng",
      dataIndex: "contract",
      key: "contract",
      width: 100,
      align: "center",
      sorter: (a, b) => a.contract - b.contract,
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      width: 150,
      align: "right",
      render: (value) => `₫${Number(value || 0).toLocaleString("vi-VN")}`,
      sorter: (a, b) => (a.revenue || 0) - (b.revenue || 0),
    },
    {
      title: "Khách hàng",
      dataIndex: "customer",
      key: "customer",
      width: 120,
      align: "center",
      sorter: (a, b) => a.customer - b.customer,
    },
    {
      title: "KPI (%)",
      dataIndex: "kpi",
      key: "kpi",
      width: 100,
      align: "center",
      render: (kpi) => getKPITag(kpi),
      sorter: (a, b) => a.kpi - b.kpi,
      defaultSortOrder: "descend",
    },
    {
      title: "Tiến độ",
      key: "progress",
      width: 150,
      render: (_, record) => (
        <Progress
          percent={record.kpi}
          size="small"
          strokeColor={getKPIColor(record.kpi)}
          showInfo={false}
        />
      ),
    },
    {
      title: "Đánh giá",
      dataIndex: "evaluation",
      key: "evaluation",
      width: 120,
      filters: [
        { text: "Xuất sắc", value: "Xuất sắc" },
        { text: "Tốt", value: "Tốt" },
        { text: "Trung bình", value: "Trung bình" },
      ],
      onFilter: (value, record) => record.evaluation === value,
    },
  ];

  const handleDownloadAll = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [
      [
        "Tên nhân viên",
        "Phòng ban",
        "Hợp đồng",
        "Doanh thu",
        "Khách hàng",
        "KPI (%)",
        "Đánh giá",
      ],
      ...reports.map((r) => [
        r.employeeName,
        r.department,
        r.contract,
        r.revenue,
        r.customer,
        r.kpi,
        r.evaluation,
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws["!cols"] = [
      { wch: 20 },
      { wch: 15 },
      { wch: 10 },
      { wch: 15 },
      { wch: 12 },
      { wch: 10 },
      { wch: 15 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Báo cáo KPI");
    XLSX.writeFile(wb, "Bao_cao_KPI.xlsx");
  };

  const formatMoney = (value) => Number(value || 0).toLocaleString("vi-VN");

  return (
    <div className="reports-page-modern">
      <Title level={2}>Báo cáo KPI</Title>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng nhân viên"
              value={stats.totalEmployees}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="KPI trung bình"
              value={stats.avgKPI}
              suffix="%"
              prefix={<RiseOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Xuất sắc (≥100%)"
              value={stats.topPerformers}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={formatMoney(stats.totalRevenue)}
              prefix="₫"
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Toolbar */}
      <Card className="toolbar-card">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              Danh sách báo cáo
            </Title>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleDownloadAll}
              size="large"
            >
              Xuất báo cáo Excel
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card className="table-card">
        <Table
          columns={columns}
          dataSource={reports}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} nhân viên`,
          }}
        />
      </Card>
    </div>
  );
}
