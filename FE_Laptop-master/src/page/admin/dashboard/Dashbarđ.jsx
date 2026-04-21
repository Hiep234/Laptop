import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Tabs,
  Button,
  Dropdown,
  Menu,
  Statistic,
  Row,
  Col,
  Divider,
  Spin,
  message
} from 'antd';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CalendarOutlined,
  DownloadOutlined,
  LaptopOutlined,
  UserOutlined
} from '@ant-design/icons';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { revenueByMonth } from "../../../Redux/actions/OrderItemThunk";
import { useDispatch } from "react-redux";
import * as XLSX from 'xlsx';
import './dashboard.scss';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const [selectedYear, setSelectedYear] = useState("2025");
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Format month names
  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
    "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
    "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await dispatch(revenueByMonth(selectedYear));
        if (response) {
          // Transform API data to match our format
          const transformedData = response.map(item => ({
            month: monthNames[item.month - 1],
            revenue: item.totalRevenue,
            customers: item.customers,
            laptops: item.laptops
          }));
          setMonthlyData(transformedData);
        }
      } catch (error) {
        console.error("Error fetching revenue data:", error);
        message.error("Lỗi khi tải dữ liệu doanh thu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch, selectedYear]);

  // Calculate totals from API data
  const totalRevenue = monthlyData.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const totalCustomers = monthlyData.reduce((sum, item) => sum + (item.customers || 0), 0);
  const totalLaptops = monthlyData.reduce((sum, item) => sum + (item.laptops || 0), 0);

  // Calculate growth (using previous year as comparison)
  const revenueGrowth = monthlyData.length > 0 ?
      ((monthlyData[monthlyData.length - 1].revenue - monthlyData[0].revenue) / monthlyData[0].revenue) * 100 : 0;
  const customerGrowth = monthlyData.length > 0 ?
      ((monthlyData[monthlyData.length - 1].customers - monthlyData[0].customers) / monthlyData[0].customers) * 100 : 0;
  const laptopGrowth = monthlyData.length > 0 ?
      ((monthlyData[monthlyData.length - 1].laptops - monthlyData[0].laptops) / monthlyData[0].laptops) * 100 : 0;

  // Export to Excel function
  const exportToExcel = () => {
    try {
      // Prepare data for export
      const exportData = monthlyData.map(item => ({
        'Tháng': item.month,
        'Doanh Thu (VND)': item.revenue,
        'Số Khách Hàng': item.customers,
        'Số Sản Phẩm': item.laptops
      }));

      // Add summary row
      exportData.push({
        'Tháng': 'TỔNG CỘNG',
        'Doanh Thu (VND)': totalRevenue,
        'Số Khách Hàng': totalCustomers,
        'Số Sản Phẩm': totalLaptops
      });

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Doanh Thu");

      // Generate file name
      const fileName = `BaoCaoDoanhThu_${selectedYear}.xlsx`;

      // Export to Excel
      XLSX.writeFile(wb, fileName);
      message.success('Xuất file Excel thành công');
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      message.error('Lỗi khi xuất file Excel');
    }
  };

  // Export full report (including charts as images - this would need additional implementation)
  const exportFullReport = () => {
    message.info('Chức năng xuất báo cáo đầy đủ đang được phát triển');
  };

  // Year dropdown menu
  const yearMenu = (
      <Menu>
        <Menu.ItemGroup title="Chọn Năm">
          {[2023, 2024, 2025].map(year => (
              <Menu.Item
                  key={year}
                  onClick={() => setSelectedYear(year.toString())}
              >
                {year}
              </Menu.Item>
          ))}
        </Menu.ItemGroup>
      </Menu>
  );

  // Table columns
  const monthlyColumns = [
    {
      title: 'Tháng',
      dataIndex: 'month',
      key: 'month',
    },
    {
      title: 'Doanh Thu (VND)',
      dataIndex: 'revenue',
      key: 'revenue',
      align: 'right',
      render: (value) => value.toLocaleString('vi-VN'),
    },
    {
      title: 'Số Khách Hàng',
      dataIndex: 'customers',
      key: 'customers',
      align: 'right',
      render: (value) => value || 0,
    },
    {
      title: 'Số Sản Phẩm',
      dataIndex: 'laptops',
      key: 'laptops',
      align: 'right',
      render: (value) => value || 0,
    },
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
          <div className="custom-chart-tooltip">
            <p className="label">{label}</p>
            {payload.map((entry, index) => (
                <p key={`item-${index}`} style={{ color: entry.color }}>
                  {entry.name}: {entry.value.toLocaleString('vi-VN')}
                </p>
            ))}
          </div>
      );
    }
    return null;
  };

  return (
      <div className="dashboard-container">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '28px'
        }}>
          <h1>Bảng Doanh Thu</h1>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Dropdown overlay={yearMenu} trigger={['click']}>
              <Button size="large" style={{ borderRadius: '8px' }}>
                <CalendarOutlined /> {selectedYear}
              </Button>
            </Dropdown>
            <Button
                type="primary"
                size="large"
                style={{ borderRadius: '8px' }}
                icon={<DownloadOutlined />}
                onClick={exportToExcel}
            >
              Xuất Excel
            </Button>
          </div>
        </div>

        <Spin spinning={loading}>
          <Row gutter={24} style={{ marginBottom: '24px' }}>
            <Col span={8}>
              <Card className="dashboard-card stat-card">
                <Statistic
                    title="Tổng Doanh Thu"
                    value={totalRevenue}
                    precision={0}
                    valueStyle={{ color: 'var(--text-color)' }}
                    formatter={value => `${value.toLocaleString('vi-VN')} đ`}
                />
                <div style={{ marginTop: '12px' }}>
                  {revenueGrowth > 0 ? (
                      <span className="trend-text positive">
                    <ArrowUpOutlined /> {Math.abs(revenueGrowth).toFixed(1)}%
                  </span>
                  ) : (
                      <span className="trend-text negative">
                    <ArrowDownOutlined /> {Math.abs(revenueGrowth).toFixed(1)}%
                  </span>
                  )}
                  <span className="trend-desc">so với đầu năm</span>
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card className="dashboard-card stat-card">
                <Statistic
                    title="Tổng Khách Hàng"
                    value={totalCustomers}
                    precision={0}
                    valueStyle={{ color: 'var(--text-color)' }}
                    prefix={<UserOutlined style={{ marginRight: '8px', color: '#ff9500' }} />}
                />
                <div style={{ marginTop: '12px' }}>
                  {customerGrowth > 0 ? (
                      <span className="trend-text positive">
                    <ArrowUpOutlined /> {Math.abs(customerGrowth).toFixed(1)}%
                  </span>
                  ) : (
                      <span className="trend-text negative">
                    <ArrowDownOutlined /> {Math.abs(customerGrowth).toFixed(1)}%
                  </span>
                  )}
                  <span className="trend-desc">so với đầu năm</span>
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card className="dashboard-card stat-card">
                <Statistic
                    title="Sản Phẩm Đã Bán"
                    value={totalLaptops}
                    precision={0}
                    valueStyle={{ color: 'var(--text-color)' }}
                    prefix={<LaptopOutlined style={{ marginRight: '8px', color: '#5856d6' }} />}
                />
                <div style={{ marginTop: '12px' }}>
                  {laptopGrowth > 0 ? (
                      <span className="trend-text positive">
                    <ArrowUpOutlined /> {Math.abs(laptopGrowth).toFixed(1)}%
                  </span>
                  ) : (
                      <span className="trend-text negative">
                    <ArrowDownOutlined /> {Math.abs(laptopGrowth).toFixed(1)}%
                  </span>
                  )}
                  <span className="trend-desc">so với đầu năm</span>
                </div>
              </Card>
            </Col>
          </Row>

          <Tabs defaultActiveKey="monthly" size="large">
            <Tabs.TabPane tab="Biểu đồ Doanh Thu" key="monthly">
              <Card className="dashboard-card" style={{ marginBottom: '24px' }}>
                <h3>Doanh Thu Theo Tháng</h3>
                <p style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                  Biểu đồ doanh thu theo từng tháng trong năm {selectedYear}
                </p>
                <div style={{ height: '340px', marginTop: '20px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData} margin={{top: 20, right: 20, left: 20}}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5EA" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#8E8E93', fontSize: 13}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#8E8E93', fontSize: 13}} dx={-10} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#2997ff" /* Apple primary blue */
                          strokeWidth={4}
                          dot={{r: 4, fill: '#2997ff', strokeWidth: 2, stroke: '#fff'}}
                          activeDot={{r: 6}}
                          name="Doanh Thu"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Row gutter={24} style={{ marginBottom: '24px' }}>
                <Col span={12}>
                  <Card className="dashboard-card">
                    <h3>Khách Hàng</h3>
                    <p style={{ color: 'rgba(0, 0, 0, 0.4)' }}>Biểu đồ số lượng khách hàng</p>
                    <div style={{ height: '280px', marginTop: '16px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5EA" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#8E8E93', fontSize: 12}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#8E8E93', fontSize: 12}} dx={-10} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar
                              dataKey="customers"
                              fill="#ff9500" /* Apple orange */
                              radius={[6, 6, 0, 0]}
                              name="Khách Hàng"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card className="dashboard-card">
                    <h3>Sản Phẩm</h3>
                    <p style={{ color: 'rgba(0, 0, 0, 0.4)' }}>Biểu đồ số lượng sản phẩm</p>
                    <div style={{ height: '280px', marginTop: '16px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5EA" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#8E8E93', fontSize: 12}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#8E8E93', fontSize: 12}} dx={-10} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar
                              dataKey="laptops"
                              fill="#5856d6" /* Apple purple */
                              radius={[6, 6, 0, 0]}
                              name="Sản Phẩm"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </Col>
              </Row>

              <Card className="dashboard-card">
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <div>
                    <h3 style={{ margin: 0 }}>Chi Tiết Dữ Liệu</h3>
                    <p style={{ color: 'rgba(0, 0, 0, 0.4)', margin: '4px 0 0 0' }}>
                      Bảng chi tiết doanh thu và số lượng
                    </p>
                  </div>
                </div>
                <Table
                    columns={monthlyColumns}
                    dataSource={monthlyData}
                    rowKey="month"
                    pagination={false}
                    loading={loading}
                    className="apple-table"
                />
              </Card>
            </Tabs.TabPane>
          </Tabs>
        </Spin>
      </div>
  );
};

export default DashboardPage;