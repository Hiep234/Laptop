import React, { useEffect, useState, useContext } from 'react';
import { 
  Steps, 
  Card, 
  Form, 
  Input, 
  Button, 
  Select, 
  Upload, 
  Divider, 
  Tabs, 
  Collapse, 
  Row, 
  Col,
  Space,
  Tag,
  Avatar,
  Descriptions,
  Alert,
  Image
} from 'antd';
import { 
  UploadOutlined, 
  DeleteOutlined, 
  PlusOutlined, 
  CheckOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { adminCreateProduct, getAllBrands, getAllCategories } from '../../../Redux/actions/ProductThunk';
import { useDispatch } from 'react-redux';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useNavigate } from 'react-router-dom';
import { NotificationContext } from '../../../components/NotificationProvider';

const { Step } = Steps;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { TextArea } = Input;
const { Option } = Select;

// Step 1: Basic Information
const BasicInfoStep = ({ form, onNext, initialValues }) => {
  const [fileList, setFileList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const notification = useContext(NotificationContext);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

    const fetchCategories = async () => {
      try {
        const response = await dispatch(getAllCategories());
        if (response) {
          setCategories(response);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
  
    const fetchBrands = async () => {
      try {
        const response = await dispatch(getAllBrands());
        if (response) {
          setBrands(response);
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      notification.error({
        message: 'Lỗi',
        description: 'Bạn chỉ có thể tải lên tệp hình ảnh!',
        placement: 'topRight',
      });
    }
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      notification.error({
        message: 'Lỗi',
        description: 'Hình ảnh phải nhỏ hơn 10MB!',
        placement: 'topRight',
      });
    }
    return isImage && isLt10M;
  };

  const handleRemove = (file) => {
    const newFileList = fileList.filter(f => f.uid !== file.uid);
    setFileList(newFileList);
  };

  // Modules và formats cho Rich Text Editor với react-quill-new
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };
  
  const formats = [
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'link'
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={(values) => onNext({ ...values, images: fileList })}
    >
      <Card title="Thông tin cơ bản" bordered={false}>
        <Form.Item
          name="name"
          label="Tên sản phẩm"
          rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
        >
          <Input placeholder="Nhập tên sản phẩm" />
        </Form.Item>

        <Form.Item 
          name="description" 
          label="Mô tả"
          rules={[{ required: false }]}
        >
          <ReactQuill 
            theme="snow"
            modules={modules}
            formats={formats}
            placeholder="Nhập mô tả sản phẩm. Bạn có thể sử dụng định dạng in đậm, in nghiêng..."
            style={{ height: 200, marginBottom: 50 }}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="categoryId"
              label="Danh mục"
              rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
            >
              <Select placeholder="Chọn danh mục" loading={loading}>
                {categories.map(category => (
                  <Option key={category.id} value={category.id}>{category.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="brandId"
              label="Thương hiệu"
              rules={[{ required: true, message: 'Vui lòng chọn thương hiệu!' }]}
            >
              <Select placeholder="Chọn thương hiệu" loading={loading}>
                {brands.map(brand => (
                  <Option key={brand.id} value={brand.id}>{brand.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card title="Hình ảnh sản phẩm" bordered={false} style={{ marginTop: 16 }}>
        <Form.Item
          name="images"
          label="Tải lên hình ảnh"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          rules={[{ required: true, message: 'Vui lòng tải lên ít nhất một hình ảnh!' }]}
        >
          <Upload
            listType="picture-card"
            fileList={fileList}
            beforeUpload={beforeUpload}
            onChange={({ fileList }) => setFileList(fileList)}
            onRemove={handleRemove}
            multiple
          >
            {fileList.length >= 8 ? null : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Tải lên</div>
              </div>
            )}
          </Upload>
        </Form.Item>
      </Card>

      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Button type="primary" htmlType="submit">
          Tiếp theo <ArrowRightOutlined />
        </Button>
      </div>
    </Form>
  );
};

// Step 2: Product Options (Updated with better validation feedback)
const OptionsStep = ({ form, onNext, onBack, initialValues }) => {
  const [activeTab, setActiveTab] = useState('0');
  const [options, setOptions] = useState([{}]);
  const [codeErrors, setCodeErrors] = useState(null);
  const [optionErrors, setOptionErrors] = useState({});
  const notification = useContext(NotificationContext);
  
  // Cập nhật options từ initialValues
  useEffect(() => {
    if (initialValues.options && initialValues.options.length > 0) {
      setOptions(initialValues.options);
      form.setFieldsValue({ options: initialValues.options });
    }
  }, [initialValues.options, form]);
  
  const addOption = () => {
    const newOptions = [...options, {}];
    setOptions(newOptions);
    setActiveTab(newOptions.length - 1 + '');
  };

  const removeOption = (index) => {
    if (options.length <= 1) {
      notification.warning({
        message: 'Cảnh báo',
        description: 'Cần có ít nhất một phiên bản',
        placement: 'topRight',
      });
      return;
    }
    
    // Tạo mảng options mới đã loại bỏ phần tử cần xóa
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    
    // Cập nhật lại form để đảm bảo dữ liệu form được đồng bộ
    form.setFieldsValue({ options: newOptions });
    
    // Chuyển tab đến tab gần nhất
    setActiveTab(Math.max(0, index - 1) + '');
    
    // Xóa lỗi nếu có
    const newErrors = { ...optionErrors };
    delete newErrors[index];
    
    // Cập nhật lại các index của các lỗi (vì đã xóa một option)
    const updatedErrors = {};
    Object.keys(newErrors).forEach(errIndex => {
      const errIndexNum = parseInt(errIndex);
      if (errIndexNum > index) {
        updatedErrors[errIndexNum - 1] = newErrors[errIndexNum];
      } else {
        updatedErrors[errIndexNum] = newErrors[errIndexNum];
      }
    });
    
    setOptionErrors(updatedErrors);
  };

  // Kiểm tra trùng lặp mã phiên bản
  const validateOptionCodes = (values) => {
    const optionValues = values.options || [];
    const codes = optionValues.map(option => option.code?.trim())
                            .filter(Boolean);
    
    // Kiểm tra trùng lặp
    const uniqueCodes = new Set(codes);
    if (uniqueCodes.size !== codes.length) {
      // Tìm mã bị trùng
      const duplicateCodes = codes.filter((code, index) => 
        codes.indexOf(code) !== index
      );
      
      // Tìm index của các options có cùng code
      const errorIndexes = [];
      optionValues.forEach((option, index) => {
        if (option.code && duplicateCodes.includes(option.code.trim())) {
          errorIndexes.push(index);
        }
      });
      
      // Cập nhật lỗi cho từng option - chỉ để đánh dấu tab
      const newErrors = {};
      errorIndexes.forEach(index => {
        newErrors[index] = `Mã phiên bản "${optionValues[index].code}" bị trùng lặp.`;
      });
      
      setOptionErrors(newErrors);
      
      // Chỉ hiển thị 1 thông báo lỗi qua messageApi
      notification.error({
        message: 'Lỗi',
        description: `Mã phiên bản "${duplicateCodes[0]}" bị trùng lặp. Mỗi phiên bản phải có mã khác nhau.`,
        placement: 'topRight',
      });
      
      // Xóa thông báo lỗi cũ ở đầu form
      setCodeErrors(null);
      
      // Chuyển đến tab đầu tiên có lỗi
      if (errorIndexes.length > 0) {
        setActiveTab(errorIndexes[0] + '');
      }
      
      return false;
    }
    
    setCodeErrors(null);
    setOptionErrors({});
    return true;
  };

  const handleSubmit = (values) => {

    // Validate toàn bộ dữ liệu form trước
    form.validateFields().then(values => {
      console.log('Form values:', values);
      // Kiểm tra các trường bắt buộc trong mỗi option
      const allOptionsValid = values.options?.every((option, index) => {
        return (
          option.code && 
          option.code.trim() && 
          option.price
        );
      });

      if (!allOptionsValid) {
        // Tìm option đầu tiên có thông tin không hợp lệ
        const invalidOptionIndex = values.options?.findIndex((option, index) => {
          return !option.code || !option.code.trim() || !option.price;
        });
        
        // Xác định thông báo lỗi cụ thể
        let errorMessage = `Phiên bản ${invalidOptionIndex + 1}: `;
        if (!values.options[invalidOptionIndex].code || !values.options[invalidOptionIndex].code.trim()) {
          errorMessage += 'Vui lòng nhập mã phiên bản!';
          const newErrors = { ...optionErrors };
          newErrors[invalidOptionIndex] = errorMessage;
          setOptionErrors(newErrors);
        } else if (!values.options[invalidOptionIndex].price) {
          errorMessage += 'Vui lòng nhập giá!';
          const newErrors = { ...optionErrors };
          newErrors[invalidOptionIndex] = errorMessage;
          setOptionErrors(newErrors);
        }
        
        // Hiển thị thông báo lỗi
        notification.error({
          message: 'Lỗi',
          description: errorMessage,
          placement: 'topRight',
        });
        
        // Chuyển tab đến option có lỗi
        setActiveTab(invalidOptionIndex + '');
        return;
      }
      
      // Xóa các lỗi nếu có
      setOptionErrors({});
      
      // Kiểm tra mã không trùng lặp
      if (!validateOptionCodes(values)) {
        return;
      }
      
      // Tất cả dữ liệu hợp lệ, tiếp tục bước tiếp theo
      const updatedOptions = form.getFieldValue('options');
      onNext({ options: updatedOptions });
    }).catch(error => {
      console.log('Validation failed:', error);
      
      // Tìm tab có lỗi và chuyển đến
      if (error.errorFields && error.errorFields.length > 0) {
        // Tìm option index từ lỗi đầu tiên
        const errorField = error.errorFields[0].name;
        if (errorField.length > 1 && errorField[0] === 'options') {
          const errorOptionIndex = errorField[1];
          setActiveTab(errorOptionIndex + '');
          
          // Tạo thông báo lỗi từ lỗi đầu tiên
          const errorMessage = `Phiên bản ${parseInt(errorOptionIndex) + 1}: ${error.errorFields[0].errors[0]}`;
          notification.error({
            message: 'Lỗi',
            description: errorMessage,
            placement: 'topRight',
          });
          
          // Cập nhật state lỗi
          const newErrors = { ...optionErrors };
          newErrors[errorOptionIndex] = errorMessage;
          setOptionErrors(newErrors);
        }
      }
    });
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ options }}>
      <Card 
        title="Phiên bản sản phẩm" 
        bordered={false}
        extra={
          <Button type="dashed" onClick={addOption} icon={<PlusOutlined />}>
            Thêm phiên bản
          </Button>
        }
      >
        {Object.keys(optionErrors).length > 0 && (
          <Alert
            message="Lỗi thông tin phiên bản"
            description="Một số phiên bản có thông tin không hợp lệ. Vui lòng kiểm tra lại các mục được đánh dấu."
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="editable-card"
          onEdit={(targetKey, action) => {
            if (action === 'add') {
              // Xử lý thêm tab mới khi nhấn dấu +
              addOption();
            } else if (action === 'remove') {
              removeOption(parseInt(targetKey));
            }
          }}
        >
          {options.map((option, index) => (
            <TabPane
              tab={
                <span>
                  {`Phiên bản ${index + 1}`}
                  {optionErrors[index] && <Tag color="red" style={{ marginLeft: 8 }}>Lỗi</Tag>}
                </span>
              }
              key={index + ''}
              closable={options.length > 1}
            >
              <div style={{ padding: '0 16px' }}>
                {/* Không hiển thị thông báo lỗi chi tiết trong tab */}
                
                <Row gutter={16}>
                  <Col span={12}>
                  
                    <Form.Item
                      name={['options', index, 'code']}
                      label="Mã phiên bản"
                      rules={[{ required: true, message: 'Vui lòng nhập mã phiên bản!' }]}
                    >
                      <Input placeholder="VD: FX507ZC4" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name={['options', index, 'price']}
                      label="Giá"
                      rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
                    >
                      <Input type="number" placeholder="0.00" />
                    </Form.Item>
                  </Col>
                </Row>

                <Collapse defaultActiveKey={['1']} ghost>
                  <Panel header="Hiệu năng" key="1">
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name={['options', index, 'cpu']} label="CPU">
                          <Input placeholder="VD: Intel Core i7-12700H" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name={['options', index, 'gpu']} label="GPU">
                          <Input placeholder="VD: NVIDIA RTX 3060" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Panel>

                  <Panel header="Bộ nhớ & Lưu trữ" key="2">
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item name={['options', index, 'ram']} label="RAM">
                          <Input placeholder="VD: 16GB" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name={['options', index, 'ramType']} label="Loại RAM">
                          <Input placeholder="VD: DDR4" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name={['options', index, 'ramSlot']} label="Khe RAM">
                          <Input placeholder="VD: 2 khe" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name={['options', index, 'storage']} label="Lưu trữ">
                          <Input placeholder="VD: 512GB SSD" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name={['options', index, 'storageUpgrade']} label="Nâng cấp lưu trữ">
                          <Input placeholder="VD: Mở rộng lên đến 2TB" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Panel>

                  <Panel header="Màn hình" key="3">
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item name={['options', index, 'displaySize']} label="Kích thước màn hình">
                          <Input placeholder="VD: 15.6 inch" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name={['options', index, 'displayResolution']} label="Độ phân giải">
                          <Input placeholder="VD: 1920x1080" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name={['options', index, 'displayRefreshRate']} label="Tần số quét">
                          <Input placeholder="VD: 144Hz" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item name={['options', index, 'displayTechnology']} label="Công nghệ màn hình">
                      <Input placeholder="VD: IPS, OLED, Mini-LED" />
                    </Form.Item>
                  </Panel>

                  <Panel header="Âm thanh & Camera" key="5">
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name={['options', index, 'audioFeatures']} label="Tính năng âm thanh">
                          <Input placeholder="VD: Dolby Atmos, THX Spatial Audio" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name={['options', index, 'webcam']} label="Webcam">
                          <Input placeholder="VD: HD 720p, FHD 1080p với IR" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Panel>

                  <Panel header="Tính năng khác" key="4">
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name={['options', index, 'keyboard']} label="Bàn phím">
                          <Input placeholder="VD: Bàn phím có đèn nền" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name={['options', index, 'security']} label="Bảo mật">
                          <Input placeholder="VD: Cảm biến vân tay" />
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name={['options', index, 'os']} label="Hệ điều hành">
                          <Input placeholder="VD: Windows 11 Home" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name={['options', index, 'weight']} label="Trọng lượng">
                          <Input placeholder="VD: 2.1 kg" />
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name={['options', index, 'battery']} label="Pin">
                          <Input placeholder="VD: 4-cell, 70Wh" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name={['options', index, 'dimension']} label="Kích thước">
                          <Input placeholder="VD: 359 x 254 x 22.4 mm" />
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name={['options', index, 'wifi']} label="Wi-Fi">
                          <Input placeholder="VD: WiFi 6E (802.11ax)" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name={['options', index, 'bluetooth']} label="Bluetooth">
                          <Input placeholder="VD: Bluetooth 5.2" />
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    <Form.Item name={['options', index, 'ports']} label="Cổng kết nối">
                      <Input placeholder="VD: 2x USB-A, 1x USB-C, HDMI, Ethernet" />
                    </Form.Item>
                    
                    <Form.Item name={['options', index, 'specialFeatures']} label="Tính năng đặc biệt">
                      <Input.TextArea placeholder="VD: Quạt tản nhiệt siêu mỏng, Công nghệ làm mát Vapor Chamber" />
                    </Form.Item>
                  </Panel>
                </Collapse>
              </div>
            </TabPane>
          ))}
        </Tabs>
      </Card>

      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Space>
          <Button onClick={onBack}>
            <ArrowLeftOutlined /> Quay lại
          </Button>
          <Button type="primary" htmlType="submit">
            Tiếp theo <ArrowRightOutlined />
          </Button>
        </Space>
      </div>
    </Form>
  );
};

// Step 3: Product Variants - Fixed version
const VariantsStep = ({ form, onNext, onBack, initialValues }) => {
  const [activeTab, setActiveTab] = useState('0');
  const [options, setOptions] = useState([]);
  const [variants, setVariants] = useState({});
  const [colorErrors, setColorErrors] = useState({});
  const notification = useContext(NotificationContext);

  // Cập nhật options từ initialValues
  useEffect(() => {
    if (initialValues.options && initialValues.options.length > 0) {
      setOptions(initialValues.options);
    }
  }, [initialValues.options]);

  // Cập nhật variants từ initialValues
  useEffect(() => {
    if (initialValues.variants && Object.keys(initialValues.variants).length > 0) {
      setVariants(initialValues.variants);
      form.setFieldsValue({ variants: initialValues.variants });
    } else if (options.length > 0) {
      // Khởi tạo variants nếu chưa có
      const initialVariants = {};
      options.forEach((option, index) => {
        if (!initialVariants[index]) {
          initialVariants[index] = [{ color: '', priceDiff: 0, stock: 1 }];
        }
      });
      setVariants(initialVariants);
      form.setFieldsValue({ variants: initialVariants });
    }
  }, [options, initialValues.variants, form]);

  // Cập nhật useEffect trong VariantsStep
  useEffect(() => {
    if (options.length > 0) {
      // Tạo variants mới nếu cần thiết
      const initialVariants = { ...variants };
      
      // Xóa bỏ các variants của options đã bị xóa
      Object.keys(initialVariants).forEach(optionIndex => {
        if (parseInt(optionIndex) >= options.length) {
          delete initialVariants[optionIndex];
        }
      });
      
      // Tạo variants cho options mới
      let needsUpdate = false;
      options.forEach((_, index) => {
        if (!initialVariants[index] || initialVariants[index].length === 0) {
          initialVariants[index] = [{ color: '', priceDiff: 0, stock: 1 }];
          needsUpdate = true;
        }
      });
      
      if (needsUpdate || Object.keys(initialVariants).length !== Object.keys(variants).length) {
        setVariants(initialVariants);
        form.setFieldsValue({ variants: initialVariants });
      }
    }
  }, [options, form]);

  const addVariant = (optionIndex) => {
    const newVariants = { ...variants };
    if (!newVariants[optionIndex]) {
      newVariants[optionIndex] = [];
    }
    newVariants[optionIndex] = [...newVariants[optionIndex], { color: '', priceDiff: 0, stock: 1 }];
    setVariants(newVariants);
    form.setFieldsValue({ variants: newVariants });
  };

  const removeVariant = (optionIndex, variantIndex) => {
    if (!variants[optionIndex] || variants[optionIndex].length <= 1) {
      notification.warning({
        message: 'Cảnh báo',
        description: 'Cần có ít nhất một màu sắc',
        placement: 'topRight',
      });
      return;
    }
    const newVariants = { ...variants };
    newVariants[optionIndex] = newVariants[optionIndex].filter((_, i) => i !== variantIndex);
    setVariants(newVariants);
    form.setFieldsValue({ variants: newVariants });
    
    // Kiểm tra lại màu sắc sau khi xóa
    validateColorsForOption(optionIndex, newVariants);
  };

  // Validate colors cho một option cụ thể
  const validateColorsForOption = (optionIndex, currentVariants = variants) => {
    const optionVariants = currentVariants[optionIndex] || [];
    const colors = optionVariants.map(v => v.color?.trim().toLowerCase()).filter(Boolean);
    
    // Check for duplicate colors
    const uniqueColors = new Set(colors);
    if (uniqueColors.size !== colors.length && colors.length > 0) {
      // Tìm màu bị trùng
      const duplicateColors = colors.filter((color, index) => 
        colors.indexOf(color) !== index
      );
      
      const errorMsg = `Màu "${duplicateColors[0]}" bị trùng lặp trong phiên bản "${options[optionIndex]?.code || ''}". Mỗi màu sắc phải có màu khác nhau.`;
      setColorErrors(prev => ({...prev, [optionIndex]: errorMsg}));
      return false;
    } else {
      // Xóa lỗi nếu đã hợp lệ
      setColorErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[optionIndex];
        return newErrors;
      });
      return true;
    }
  };

  // Validate colors for all options
  const validateColors = () => {
    let isValid = true;
    const newColorErrors = {};

    Object.keys(variants).forEach(optionIndex => {
      if (!validateColorsForOption(optionIndex)) {
        isValid = false;
      }
    });

    return isValid;
  };

  // Hàm xử lý khi người dùng thay đổi màu sắc
  const handleColorChange = (optionIndex, variantIndex, value) => {
    const newVariants = { ...variants };
    newVariants[optionIndex][variantIndex].color = value;
    setVariants(newVariants);
    
    // Kiểm tra trùng lặp màu sắc ngay khi người dùng nhập
    validateColorsForOption(optionIndex, newVariants);
  };

  const handleImageChange = (optionIndex, variantIndex, info) => {
    // Handle image change and update form
    const newVariants = { ...variants };
    newVariants[optionIndex][variantIndex].image = info.fileList.length > 0 ? info.fileList : undefined;
    setVariants(newVariants);
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      notification.error({
        message: 'Lỗi',
        description: 'Chỉ được tải lên hình ảnh!',
        placement: 'topRight',
      });
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      notification.error({
        message: 'Lỗi',
        description: 'Hình ảnh phải nhỏ hơn 5MB!',
        placement: 'topRight',
      });
    }
    return false; // Prevent auto upload
  };

  const handleSubmit = () => {
    // Chắc chắn rằng tất cả variants đã được khởi tạo cho mỗi option
    const allOptionsHaveVariants = options.every((_, optionIndex) => 
      variants[optionIndex] && variants[optionIndex].length > 0
    );

    if (!allOptionsHaveVariants) {
      // Tìm option đầu tiên không có variant
      const missingOptionIndex = options.findIndex((_, optionIndex) => 
        !variants[optionIndex] || variants[optionIndex].length === 0
      );

      notification.error({
        message: 'Lỗi',
        description: `Phiên bản "${options[missingOptionIndex]?.code || `#${missingOptionIndex}`}" chưa có màu sắc nào. Vui lòng thêm màu sắc cho tất cả phiên bản.`,
        placement: 'topRight',
      });
      
      // Chuyển tab đến option thiếu màu sắc
      setActiveTab(missingOptionIndex + '');
      return;
    }

    // Validate toàn bộ dữ liệu form trước
    form.validateFields().then(values => {
      // Kiểm tra xem tất cả các option có ít nhất một variant với đầy đủ thông tin không
      const allVariantsValid = options.every((option, optionIndex) => {
        const optionVariants = variants[optionIndex] || [];
        
        // Kiểm tra từng variant trong option
        return optionVariants.length > 0 && optionVariants.every(variant => 
          variant.color && variant.stock && variant.image && variant.image.length > 0
        );
      });

      if (!allVariantsValid) {
        // Tìm option đầu tiên có variant không hợp lệ
        const invalidOptionIndex = options.findIndex((option, optionIndex) => {
          const optionVariants = variants[optionIndex] || [];
          
          return optionVariants.length === 0 || optionVariants.some(variant => 
            !variant.color || !variant.stock || !variant.image || variant.image.length === 0
          );
        });

        notification.error({
          message: 'Lỗi',
          description: `Phiên bản "${options[invalidOptionIndex]?.code || `#${invalidOptionIndex + 1}`}" có màu sắc chưa đủ thông tin. Vui lòng kiểm tra lại.`,
          placement: 'topRight',
        });
        // Chuyển tab đến option có variant không hợp lệ
        setActiveTab(invalidOptionIndex + '');
        return;
      }

      // Validate colors are unique within each option
      if (!validateColors()) {
        // Tìm option đầu tiên có lỗi trùng màu
        const errorOptionIndex = Object.keys(colorErrors)[0];
        if (errorOptionIndex) {
          // Chuyển tab đến option có lỗi trùng màu
          setActiveTab(errorOptionIndex);
        }
        return;
      }
      
      // Tất cả dữ liệu hợp lệ, tiếp tục bước tiếp theo
      onNext({ variants: form.getFieldValue('variants') });
    }).catch(error => {
      console.error('Validation failed:', error);
      // Tìm tab có lỗi và chuyển đến
      if (error.errorFields && error.errorFields.length > 0) {
        // Tìm option index từ lỗi đầu tiên
        const errorField = error.errorFields[0].name;
        if (errorField.length > 1 && errorField[0] === 'variants') {
          const errorOptionIndex = errorField[1];
          setActiveTab(errorOptionIndex + '');
          notification.error({
            message: 'Lỗi',
            description: `Phiên bản ${parseInt(errorOptionIndex) + 1} có lỗi. Vui lòng kiểm tra lại.`,
            placement: 'topRight',
          });
        }
      }
    });
  };

  // Xử lý nút Quay lại
  const handleBackClick = () => {
    // Lưu dữ liệu hiện tại trước khi quay lại
    const currentVariants = form.getFieldValue('variants');
    if (currentVariants) {
      onBack({ variants: currentVariants });
    } else {
      onBack();
    }
  };

  if (!options || options.length === 0) {
    return (
      <Card bordered={false}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p>Vui lòng thêm ít nhất một phiên bản sản phẩm trước khi thêm màu sắc.</p>
          <Button type="primary" onClick={handleBackClick} style={{ marginTop: 16 }}>
            <ArrowLeftOutlined /> Quay lại Phiên bản
          </Button>
        </div>
      </Card>
    );
  }

  // Phần render của VariantsStep
  return (
    <Form form={form} layout="vertical">
      <Card title="Màu sắc sản phẩm" bordered={false}>
        {/* Hiển thị thông báo toàn cục nếu cần */}
        {Object.keys(colorErrors).length > 0 && (
          <Alert
            message="Cảnh báo"
            description="Có lỗi trùng màu sắc trong một số phiên bản. Vui lòng kiểm tra và sửa lỗi trước khi tiếp tục."
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {options.map((option, optionIndex) => (
            <TabPane 
              tab={
                <span>
                  {`Phiên bản ${optionIndex + 1}: ${option.code || 'Chưa đặt tên'}`}
                  {colorErrors[optionIndex] && <Tag color="red" style={{ marginLeft: 8 }}>Lỗi</Tag>}
                </span>
              } 
              key={optionIndex + ''}
            >
              <div style={{ marginBottom: 16 }}>
                <Button 
                  type="dashed" 
                  onClick={() => addVariant(optionIndex)}
                  icon={<PlusOutlined />}
                >
                  Thêm màu sắc
                </Button>
              </div>

              {colorErrors[optionIndex] && (
                <div style={{ 
                  color: '#ff4d4f', 
                  marginBottom: 16,
                  padding: '8px 12px', 
                  background: '#fff2f0', 
                  border: '1px solid #ffccc7',
                  borderRadius: '4px'
                }}>
                  {colorErrors[optionIndex]}
                </div>
              )}

              {variants[optionIndex] && variants[optionIndex].map((variant, variantIndex) => (
                <Card
                  key={variantIndex}
                  title={`Màu sắc ${variantIndex + 1}`}
                  style={{ marginBottom: 16 }}
                  extra={
                    <Button
                      danger
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => removeVariant(optionIndex, variantIndex)}
                      disabled={(variants[optionIndex] || []).length <= 1}
                    />
                  }
                >
                  <Form.Item
                    name={['variants', optionIndex, variantIndex, 'color']}
                    label="Màu sắc"
                    rules={[{ required: true, message: 'Vui lòng nhập màu sắc!' }]}
                  >
                    <Input 
                      placeholder="VD: Đen, Bạc" 
                      onChange={(e) => handleColorChange(optionIndex, variantIndex, e.target.value)}
                    />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name={['variants', optionIndex, variantIndex, 'priceDiff']}
                        label="Chênh lệch giá"
                      >
                        <Input type="number" placeholder="0.00" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name={['variants', optionIndex, variantIndex, 'stock']}
                        label="Số lượng"
                        rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
                      >
                        <Input type="number" placeholder="0" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name={['variants', optionIndex, variantIndex, 'image']}
                    label="Hình ảnh màu sắc"
                    valuePropName="fileList"
                    getValueFromEvent={(e) => e.fileList}
                    rules={[{ required: true, message: 'Vui lòng tải lên hình ảnh màu sắc!' }]}
                  >
                    <Upload 
                      listType="picture-card" 
                      maxCount={1}
                      beforeUpload={beforeUpload}
                      onChange={(info) => handleImageChange(optionIndex, variantIndex, info)}
                    >
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Tải lên</div>
                      </div>
                    </Upload>
                  </Form.Item>
                </Card>
              ))}
            </TabPane>
          ))}
        </Tabs>
      </Card>
      
      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Space>
          <Button onClick={handleBackClick}>
            <ArrowLeftOutlined /> Quay lại
          </Button>
          <Button type="primary" onClick={handleSubmit}>
            Tiếp theo <ArrowRightOutlined />
          </Button>
        </Space>
      </div>
    </Form>
  );
};

// Step 4: Review and Submit (Updated with redirect)
const ReviewStep = ({ formData, onSubmit, onBack }) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const notification = useContext(NotificationContext);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Create FormData object for multipart/form-data
      const formDataObj = new FormData();
      
      // Add basic product info
      formDataObj.append("name", formData.basicInfo.name);
      
      // Mô tả sản phẩm đã có định dạng HTML
      formDataObj.append("description", formData.basicInfo.description || '');
      formDataObj.append("categoryId", formData.basicInfo.categoryId);
      formDataObj.append("brandId", formData.basicInfo.brandId);
      
      // Add product thumbnail images
      if (formData.basicInfo.images && formData.basicInfo.images.length > 0) {
        formData.basicInfo.images.forEach(image => {
          if (image.originFileObj) {
            formDataObj.append("imageThumbnails", image.originFileObj);
          }
        });
      }
      
      // Prepare options and variants - Thêm options là một mảng và variants chứa hình ảnh
      formData.options.forEach((option, optionIndex) => {
        const optionKey = `options[${optionIndex}]`;
        
        // Thêm thông tin cơ bản của option
        formDataObj.append(`${optionKey}.code`, option.code);
        formDataObj.append(`${optionKey}.price`, option.price);
        
        // Thêm các thuộc tính kỹ thuật của option
        formDataObj.append(`${optionKey}.cpu`, option.cpu || '');
        formDataObj.append(`${optionKey}.gpu`, option.gpu || '');
        formDataObj.append(`${optionKey}.ram`, option.ram || '');
        formDataObj.append(`${optionKey}.ramType`, option.ramType || '');
        formDataObj.append(`${optionKey}.ramSlot`, option.ramSlot || '');
        formDataObj.append(`${optionKey}.storage`, option.storage || '');
        formDataObj.append(`${optionKey}.storageUpgrade`, option.storageUpgrade || '');
        formDataObj.append(`${optionKey}.displaySize`, option.displaySize || '');
        formDataObj.append(`${optionKey}.displayResolution`, option.displayResolution || '');
        formDataObj.append(`${optionKey}.displayRefreshRate`, option.displayRefreshRate || '');
        formDataObj.append(`${optionKey}.displayTechnology`, option.displayTechnology || '');
        formDataObj.append(`${optionKey}.audioFeatures`, option.audioFeatures || '');
        formDataObj.append(`${optionKey}.keyboard`, option.keyboard || '');
        formDataObj.append(`${optionKey}.security`, option.security || '');
        formDataObj.append(`${optionKey}.webcam`, option.webcam || '');
        formDataObj.append(`${optionKey}.operatingSystem`, option.operatingSystem || option.os || '');
        formDataObj.append(`${optionKey}.battery`, option.battery || '');
        formDataObj.append(`${optionKey}.weight`, option.weight || '');
        formDataObj.append(`${optionKey}.dimension`, option.dimension || '');
        formDataObj.append(`${optionKey}.wifi`, option.wifi || '');
        formDataObj.append(`${optionKey}.bluetooth`, option.bluetooth || '');
        formDataObj.append(`${optionKey}.ports`, option.ports || '');
        formDataObj.append(`${optionKey}.specialFeatures`, option.specialFeatures || '');
        
        // Thêm thông tin về variants
        const optionVariants = formData.variants[optionIndex] || [];
        optionVariants.forEach((variant, variantIndex) => {
          const variantKey = `${optionKey}.variants[${variantIndex}]`;
          
          formDataObj.append(`${variantKey}.color`, variant.color);
          formDataObj.append(`${variantKey}.priceDiff`, variant.priceDiff || 0);
          formDataObj.append(`${variantKey}.stock`, parseInt(variant.stock) || 0);
          
          // Thêm hình ảnh cho variant
          if (variant.image && variant.image[0] && variant.image[0].originFileObj) {
            formDataObj.append(`${variantKey}.image`, variant.image[0].originFileObj);
          }
        });
      });
      
      // Gửi đến API thông qua Redux action
      const response = await dispatch(adminCreateProduct(formDataObj));
      
      if (response === 201) {
        notification.success({
          message: 'Thành công',
          description: 'Thêm sản phẩm thành công!',
          placement: 'topRight',
        });
        onSubmit();
        navigate('/admin/laptops');

      } else {
        notification.error({
          message: 'Lỗi',
          description: 'Thêm sản phẩm thất bại!',
          placement: 'topRight',
        });
      }
    } catch (error) {
      console.error('Lỗi khi thêm sản phẩm:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Đã xảy ra lỗi khi tạo sản phẩm. Vui lòng thử lại.',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card title="Xem lại thông tin sản phẩm" bordered={false}>
        <Descriptions title="Thông tin cơ bản" bordered column={2}>
          <Descriptions.Item label="Tên sản phẩm">{formData.basicInfo.name}</Descriptions.Item>
          <Descriptions.Item label="Danh mục">
            {formData.basicInfo.categoryId}
          </Descriptions.Item>
          <Descriptions.Item label="Thương hiệu">
            {formData.basicInfo.brandId}
          </Descriptions.Item>
          <Descriptions.Item label="Số lượng ảnh">{formData.basicInfo.images?.length || 0}</Descriptions.Item>
          <Descriptions.Item label="Ảnh sản phẩm" span={2}>
            {formData.basicInfo.images && formData.basicInfo.images.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {formData.basicInfo.images.map((image, index) => (
                  <Image
                    key={index}
                    width={100}
                    height={100}
                    src={image.url || image.thumbUrl || (image.originFileObj && URL.createObjectURL(image.originFileObj))}
                    alt={`Product thumbnail ${index + 1}`}
                    style={{ objectFit: 'cover', borderRadius: '4px' }}
                  />
                ))}
              </div>
            ) : (
              'Không có ảnh'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Mô tả" span={2}>
            {formData.basicInfo.description ? (
              <div dangerouslySetInnerHTML={{ __html: formData.basicInfo.description }} />
            ) : (
              'Không có mô tả'
            )}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Collapse defaultActiveKey={['0']}>
          {formData.options?.map((option, index) => (
            <Panel 
              header={`Phiên bản ${index + 1}: ${option.code || 'Chưa đặt tên'}`} 
              key={index}
              extra={<Tag color="blue">{option.price ? `${option.price}đ` : 'Chưa có giá'}</Tag>}
            >
              <Tabs defaultActiveKey="1">
                <TabPane tab="Hiệu năng" key="1">
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label="CPU">{option.cpu || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="GPU">{option.gpu || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="RAM">{option.ram || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Loại RAM">{option.ramType || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Khe RAM">{option.ramSlot || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Lưu trữ">{option.storage || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Nâng cấp lưu trữ">{option.storageUpgrade || 'N/A'}</Descriptions.Item>
                  </Descriptions>
                </TabPane>

                <TabPane tab="Màn hình" key="2">
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label="Kích thước màn hình">{option.displaySize || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Độ phân giải">{option.displayResolution || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Tần số quét">{option.displayRefreshRate || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Công nghệ màn hình">{option.displayTechnology || 'N/A'}</Descriptions.Item>
                  </Descriptions>
                </TabPane>

                <TabPane tab="Âm thanh & Camera" key="3">
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label="Tính năng âm thanh">{option.audioFeatures || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Webcam">{option.webcam || 'N/A'}</Descriptions.Item>
                  </Descriptions>
                </TabPane>

                <TabPane tab="Tính năng khác" key="4">
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label="Bàn phím">{option.keyboard || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Bảo mật">{option.security || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Hệ điều hành">{option.operatingSystem || option.os || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Pin">{option.battery || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Trọng lượng">{option.weight || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Kích thước">{option.dimension || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Wi-Fi">{option.wifi || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Bluetooth">{option.bluetooth || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Cổng kết nối">{option.ports || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Tính năng đặc biệt" span={2}>{option.specialFeatures || 'N/A'}</Descriptions.Item>
                  </Descriptions>
                </TabPane>
              </Tabs>

              <Divider orientation="left">Màu sắc</Divider>
              
              <Row gutter={16}>
                {formData.variants?.[index]?.map((variant, vIndex) => (
                  <Col span={8} key={vIndex}>
                    <Card 
                      title={`Màu sắc ${vIndex + 1}`}
                      style={{ marginBottom: 16 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                        {variant.image && variant.image[0] && (
                          <Avatar 
                            src={variant.image[0].url || variant.image[0].thumbUrl || (variant.image[0].originFileObj && URL.createObjectURL(variant.image[0].originFileObj))} 
                            shape="square"
                            size={64}
                            style={{ marginRight: 16 }}
                          />
                        )}
                        <div>
                          <div><strong>Màu sắc:</strong> {variant.color || 'N/A'}</div>
                          <div><strong>Số lượng:</strong> {variant.stock || '0'}</div>
                          {variant.priceDiff && variant.priceDiff !== '0' && (
                            <div><strong>Chênh lệch giá:</strong> {variant.priceDiff}đ</div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Panel>
          ))}
        </Collapse>
      </Card>

      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Space>
          <Button onClick={onBack}>
            <ArrowLeftOutlined /> Quay lại
          </Button>
          <Button 
            type="primary" 
            onClick={handleSubmit}
            loading={loading}
            icon={<CheckOutlined />}
          >
            Thêm mới
          </Button>
        </Space>
      </div>
    </div>
  );
};

// Main Wizard Component
const ProductCreationWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    basicInfo: {},
    options: [],
    variants: {}
  });
  const notification = useContext(NotificationContext);

  const [form1] = Form.useForm();
  const [form2] = Form.useForm();
  const [form3] = Form.useForm();

  // Reset form values when navigating between steps to ensure data persistence
  useEffect(() => {
    if (currentStep === 0) {
      form1.setFieldsValue(formData.basicInfo);
    } else if (currentStep === 1) {
      form2.setFieldsValue({ options: formData.options });
    } else if (currentStep === 2) {
      form3.setFieldsValue({ variants: formData.variants });
    }
  }, [currentStep, formData, form1, form2, form3]);

  // Hàm xử lý quay lại bước trước đó với bảo toàn dữ liệu
  const handleBack = (fromStep, additionalData = {}) => {
    // Lưu dữ liệu của bước hiện tại trước khi quay lại
    if (fromStep === 2) {
      // Lưu dữ liệu từ bước Variants về Options
      setFormData(prev => ({
        ...prev,
        variants: additionalData.variants || prev.variants
      }));
    } else if (fromStep === 3) {
      // Không cần lưu dữ liệu từ bước Review vì nó chỉ hiển thị
    }
    
    // Quay lại bước trước
    setCurrentStep(fromStep - 1);
  };

  const steps = [
    {
      title: 'Thông tin laptop',
      content: (
        <BasicInfoStep 
          form={form1} 
          onNext={(data) => {
            setFormData(prev => ({ ...prev, basicInfo: data }));
            setCurrentStep(1);
          }}
          initialValues={formData.basicInfo}
        />
      ),
      icon: <UploadOutlined />
    },
    {
      title: 'Phiên bản laptop',
      content: (
        <OptionsStep 
          form={form2}
          onNext={(data) => {
            // Cập nhật options trong formData
            setFormData(prev => {
              // Tạo variants mới phù hợp với options mới
              const newVariants = {};
              data.options.forEach((_, index) => {
                // Nếu có variant cũ thì giữ lại, không thì tạo mới
                if (prev.variants[index]) {
                  newVariants[index] = prev.variants[index];
                }
              });
              
              return { 
                ...prev, 
                options: data.options,
                variants: newVariants // Cập nhật variants để loại bỏ những option đã xóa
              };
            });
            setCurrentStep(2);
          }}
          onBack={() => handleBack(1)}
          initialValues={formData}
        />
      ),
      icon: <PlusOutlined />
    },
    {
      title: 'Màu sắc',
      content: (
        <VariantsStep 
          form={form3}
          onNext={(data) => {
            setFormData(prev => ({ ...prev, ...data }));
            setCurrentStep(3);
          }}
          onBack={(data) => handleBack(2, data)}
          initialValues={formData}
        />
      ),
      icon: <PlusOutlined />
    },
    {
      title: 'Đánh giá',
      content: (
        <ReviewStep 
          formData={formData}
          onSubmit={() => {
            // Reset form after successful submission
            form1.resetFields();
            form2.resetFields();
            form3.resetFields();
            setFormData({
              basicInfo: {},
              options: [],
              variants: {}
            });
            setCurrentStep(0);
          }}
          onBack={() => handleBack(3)}
        />
      ),
      icon: <CheckOutlined />
    }
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Steps current={currentStep} style={{ marginBottom: 32 }}>
        {steps.map((item) => (
          <Step key={item.title} title={item.title} icon={item.icon} />
        ))}
      </Steps>
      
      <div className="steps-content">{steps[currentStep].content}</div>
    </div>
  );
};

// Main Page
const CreateProduct = () => {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 24 }}>Thêm laptop mới</h1>
      <ProductCreationWizard />
    </div>
  );
};

export default CreateProduct;