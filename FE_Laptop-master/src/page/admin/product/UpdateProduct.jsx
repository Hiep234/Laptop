import React, {useContext, useEffect, useState} from 'react';
import {
  Steps,
  Card,
  Form,
  Input,
  Button,
  Select,
  Upload,
  message,
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
  Image,
  Spin,
  Modal
} from 'antd';
import { 
  UploadOutlined, 
  DeleteOutlined, 
  PlusOutlined, 
  CheckOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useNavigate, useParams } from 'react-router-dom';
import { adminUpdateProduct, getAllBrands, getAllCategories, adminDetailProduct } from '../../../Redux/actions/ProductThunk';
import {NotificationContext} from "../../../components/NotificationProvider";

const { Step } = Steps;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { TextArea } = Input;
const { Option } = Select;
const { confirm } = Modal;

// Step 1: Basic Information for Update
const BasicInfoStep = ({ form, onNext, initialValues, existingImages, onDeleteImage }) => {
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

  // Tạo fileList từ images đã có
  useEffect(() => {
    if (existingImages && Array.isArray(existingImages) && existingImages.length > 0) {
      const initialFileList = existingImages.map(image => ({
        uid: `existing-${image.id}`,
        name: `image-${image.id}.jpg`,
        status: 'done',
        url: image.url,
        thumbUrl: image.url,
        id: image.id,
        isExisting: true,
      }));
      setFileList(initialFileList);
    }
  }, [existingImages]);

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
      message.error('Bạn chỉ có thể tải lên tệp hình ảnh!');
    }
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('Hình ảnh phải nhỏ hơn 10MB!');
    }
    return isImage && isLt10M;
  };

  const handleRemove = (file) => {
    if (file.id) {
      onDeleteImage(file.id);
    }
    // Nếu là hình ảnh mới, xóa trực tiếp
    const newFileList = fileList.filter(f => f.uid !== file.uid);
    setFileList(newFileList);
    return true;
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

  const handleSubmit = (values) => {
    // Phân loại file mới và file cũ
    const newImages = fileList.filter(file => !file.id);
    const existingImageIds = fileList.filter(file => file.id).map(file => file.id);

    onNext({
      ...values,
      images: fileList,
      existingImageIds: existingImageIds,
      newImages: newImages,
    });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={handleSubmit}
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
          label="Hình ảnh hiện tại và tải lên mới"
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

// Step 2: Product Options
const OptionsStep = ({ form, onNext, onBack, initialValues, deletedOptionIds, setDeletedOptionIds }) => {
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
      notification.error({
        message: 'Lỗi',
        description: 'Cần có ít nhất một phiên bản',
        placement: 'topRight',
      });
      return;
    }
    
    // Nếu option có id, thêm vào danh sách xóa
    const optionToRemove = options[index];
    if (optionToRemove && optionToRemove.id) {
      // Đảm bảo deletedOptionIds là một mảng
      const currentDeletedIds = Array.isArray(deletedOptionIds) ? [...deletedOptionIds] : [];
      setDeletedOptionIds([...currentDeletedIds, optionToRemove.id]);
      notification.success({
        message: 'Thành công',
        description: `Đã đánh dấu phiên bản ${optionToRemove.code} để xóa`,
        placement: 'topRight',
      });
    }

    // Cập nhật lại danh sách options
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    
    // Cập nhật lại form để đảm bảo dữ liệu form được đồng bộ
    form.setFieldsValue({ options: newOptions });
    
    // Chuyển tab đến tab gần nhất
    setActiveTab(Math.max(0, index - 1) + '');
    
    // Xóa lỗi nếu có
    const newErrors = { ...optionErrors };
    delete newErrors[index];
    
    // Cập nhật lại các index của các lỗi
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
      const duplicateCodes = codes.filter((code, index) => 
        codes.indexOf(code) !== index
      );
      
      const errorIndexes = [];
      optionValues.forEach((option, index) => {
        if (option.code && duplicateCodes.includes(option.code.trim())) {
          errorIndexes.push(index);
        }
      });
      
      const newErrors = {};
      errorIndexes.forEach(index => {
        newErrors[index] = `Mã phiên bản "${optionValues[index].code}" bị trùng lặp.`;
      });
      
      setOptionErrors(newErrors);
      notification.error({
        message: 'Lỗi',
        description: `Mã phiên bản "${duplicateCodes[0]}" bị trùng lặp. Mỗi phiên bản phải có mã khác nhau.`,
        placement: 'topRight',
      });
      setCodeErrors(null);
      
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
    form.validateFields().then(values => {
      const allOptionsValid = values.options?.every((option, index) => {
        return (
          option.code && 
          option.code.trim() && 
          option.price
        );
      });

      if (!allOptionsValid) {
        const invalidOptionIndex = values.options?.findIndex((option, index) => {
          return !option.code || !option.code.trim() || !option.price;
        });
        
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

        notification.error({
          message: 'Lỗi',
          description: errorMessage,
          placement: 'topRight',
        });
        setActiveTab(invalidOptionIndex + '');
        return;
      }
      
      setOptionErrors({});
      
      if (!validateOptionCodes(values)) {
        return;
      }
      
      const updatedOptions = form.getFieldValue('options');
      onNext({ 
        options: updatedOptions,
        deletedOptionIds: Array.isArray(deletedOptionIds) ? deletedOptionIds : []
      });
    }).catch(error => {
      console.log('Validation failed:', error);
      
      if (error.errorFields && error.errorFields.length > 0) {
        const errorField = error.errorFields[0].name;
        if (errorField.length > 1 && errorField[0] === 'options') {
          const errorOptionIndex = errorField[1];
          setActiveTab(errorOptionIndex + '');
          
          const errorMessage = `Phiên bản ${parseInt(errorOptionIndex) + 1}: ${error.errorFields[0].errors[0]}`;
          notification.error({
            message: 'Lỗi',
            description: errorMessage,
            placement: 'topRight',
          });
          
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
        
        {Array.isArray(deletedOptionIds) && deletedOptionIds.length > 0 && (
          <Alert
            message={`Đã đánh dấu ${deletedOptionIds.length} phiên bản để xóa`}
            description="Các phiên bản này sẽ bị xóa khi bạn lưu thay đổi."
            type="warning"
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
                  {`Phiên bản ${index + 1}${option.code ? `: ${option.code}` : ''}`}
                  {optionErrors[index] && <Tag color="red" style={{ marginLeft: 8 }}>Lỗi</Tag>}
                </span>
              }
              key={index + ''}
              closable={options.length > 1}
            >
              <div style={{ padding: '0 16px' }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name={['options', index, 'id']}
                      hidden={true}
                    >
                      <Input />
                    </Form.Item>
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
                        <Form.Item name={['options', index, 'operatingSystem']} label="Hệ điều hành">
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

// Step 3: Product Variants
const VariantsStep = ({ form, onNext, onBack, initialValues, deletedVariantIds, setDeletedVariantIds, deletedOptionIds }) => {
  const [activeTab, setActiveTab] = useState('0');
  const [options, setOptions] = useState([]);
  const [variants, setVariants] = useState({});
  const [colorErrors, setColorErrors] = useState({});
  const notification = useContext(NotificationContext);

  // Cập nhật options từ initialValues, lọc bỏ options bị đánh dấu xóa
  useEffect(() => {
    if (initialValues.options && initialValues.options.length > 0) {
      // Lọc bỏ các option đã bị đánh dấu xóa
      const activeOptions = initialValues.options.filter(option => 
        !Array.isArray(deletedOptionIds) || !deletedOptionIds.includes(option.id)
      );
      setOptions(activeOptions);
    }
  }, [initialValues.options, deletedOptionIds]);

  // Khởi tạo variants từ options
  useEffect(() => {
    if (options.length > 0) {
      const initialVariants = { ...variants };
      
      // Xóa bỏ các variants của options đã bị xóa hoặc options không còn tồn tại
      Object.keys(initialVariants).forEach(optionIndex => {
        if (parseInt(optionIndex) >= options.length) {
          delete initialVariants[optionIndex];
        }
      });
      
      // Tạo hoặc cập nhật variants cho từng option còn lại
      options.forEach((option, index) => {
        if (!initialVariants[index]) {
          // Nếu option có sẵn variants từ backend
          if (option.productVariants && option.productVariants.length > 0) {
            initialVariants[index] = option.productVariants.map(variant => ({
              id: variant.id,
              color: variant.color,
              priceDiff: variant.priceDiff,
              stock: variant.stock,
              imageUrl: variant.imageUrl,
              // Nếu có hình ảnh, tạo đối tượng hiển thị
              ...(variant.imageUrl && {
                image: [{
                  uid: `existing-variant-${variant.id}`,
                  name: `variant-${variant.id}.jpg`,
                  status: 'done',
                  url: variant.imageUrl,
                  thumbUrl: variant.imageUrl,
                  isExisting: true
                }]
              })
            }));
          } else {
            initialVariants[index] = [{ color: '', priceDiff: 0, stock: 1 }];
          }
        }
      });
      
      setVariants(initialVariants);
      form.setFieldsValue({ variants: initialVariants });
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

// Trong VariantsStep component
const removeVariant = (optionIndex, variantIndex) => {
  if (!variants[optionIndex] || variants[optionIndex].length <= 1) {
    notification.error({
      message: 'Lỗi',
      description: 'Cần có ít nhất một màu sắc',
      placement: 'topRight',
    });
    return;
  }

  // Kiểm tra nếu variant đã tồn tại trong DB (có ID), thêm vào danh sách xóa
  const variantToRemove = variants[optionIndex][variantIndex];
  if (variantToRemove && variantToRemove.id) {
    // Thêm vào danh sách variant bị xóa cho option này
    const optionId = options[optionIndex].id;
    if (optionId) {
      // Tạo bản sao của deletedVariantIds hiện tại
      const updatedDeletedVariantIds = { ...deletedVariantIds };
      
      // Đảm bảo có mảng cho optionId này
      if (!updatedDeletedVariantIds[optionId]) {
        updatedDeletedVariantIds[optionId] = [];
      }
      
      // Thêm variantId vào mảng
      updatedDeletedVariantIds[optionId].push(variantToRemove.id);
      
      // Log trước khi cập nhật state
      console.log('Cập nhật deletedVariantIds:', updatedDeletedVariantIds);
      
      // Cập nhật state
      setDeletedVariantIds(updatedDeletedVariantIds);
      
      // Hiển thị thông báo thành công
      notification.success({
        message: 'Thành công',
        description: `Đã đánh dấu màu ${variantToRemove.color} để xóa`,
        placement: 'topRight',
      });
    }
  }

  // Cập nhật lại UI
  const newVariants = { ...variants };
  // Sử dụng slice để tạo mảng mới thay vì filter để tránh lỗi
  newVariants[optionIndex] = [
    ...newVariants[optionIndex].slice(0, variantIndex),
    ...newVariants[optionIndex].slice(variantIndex + 1)
  ];
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
      const duplicateColors = colors.filter((color, index) => 
        colors.indexOf(color) !== index
      );
      
      const errorMsg = `Màu "${duplicateColors[0]}" bị trùng lặp trong phiên bản "${options[optionIndex]?.code || ''}". Mỗi màu sắc phải có màu khác nhau.`;
      setColorErrors(prev => ({...prev, [optionIndex]: errorMsg}));
      return false;
    } else {
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
      const missingOptionIndex = options.findIndex((_, optionIndex) => 
        !variants[optionIndex] || variants[optionIndex].length === 0
      );

      notification.error({
        message: 'Lỗi',
        description: `Phiên bản "${options[missingOptionIndex]?.code || `#${missingOptionIndex}`}" chưa có màu sắc nào. Vui lòng thêm màu sắc cho tất cả phiên bản.`,
        placement: 'topRight',
      });
      setActiveTab(missingOptionIndex + '');
      return;
    }

    // Validate toàn bộ dữ liệu form
    form.validateFields().then(values => {
      // Kiểm tra xem tất cả các option có ít nhất một variant với đầy đủ thông tin không
      const allVariantsValid = options.every((option, optionIndex) => {
        const optionVariants = variants[optionIndex] || [];
        
        return optionVariants.length > 0 && optionVariants.every(variant => 
          variant.color && variant.stock && (variant.image || (variant.id && variant.imageUrl))
        );
      });

      if (!allVariantsValid) {
        const invalidOptionIndex = options.findIndex((option, optionIndex) => {
          const optionVariants = variants[optionIndex] || [];
          
          return optionVariants.length === 0 || optionVariants.some(variant => 
            !variant.color || !variant.stock || (!variant.image && !(variant.id && variant.imageUrl))
          );
        });
        notification.error({
          message: 'Lỗi',
          description: `Phiên bản "${options[invalidOptionIndex]?.code || `#${invalidOptionIndex + 1}`}" có màu sắc chưa đủ thông tin. Vui lòng kiểm tra lại.`,
          placement: 'topRight',
        });
        setActiveTab(invalidOptionIndex + '');
        return;
      }

      // Validate colors are unique within each option
      if (!validateColors()) {
        const errorOptionIndex = Object.keys(colorErrors)[0];
        if (errorOptionIndex) {
          setActiveTab(errorOptionIndex);
        }
        return;
      }
      
      // Tất cả dữ liệu hợp lệ, tiếp tục bước tiếp theo
      onNext({ 
        variants: form.getFieldValue('variants'),
        deletedVariantIds: deletedVariantIds,
        deletedOptionIds: deletedOptionIds
      });
    }).catch(error => {
      console.error('Validation failed:', error);
      if (error.errorFields && error.errorFields.length > 0) {
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
    const currentVariants = form.getFieldValue('variants');
    if (currentVariants) {
      onBack({ 
        variants: currentVariants,
        deletedVariantIds: deletedVariantIds,
        deletedOptionIds: Array.isArray(deletedOptionIds) ? deletedOptionIds : []
      });
    } else {
      onBack({
        deletedOptionIds: Array.isArray(deletedOptionIds) ? deletedOptionIds : []
      });
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

  // Hiển thị tổng số variant bị xóa
  const totalDeletedVariants = Object.values(deletedVariantIds || {}).reduce((acc, variantIds) => acc + variantIds.length, 0);

  return (
    <Form form={form} layout="vertical">
      <Card title="Màu sắc sản phẩm" bordered={false}>
        {Object.keys(colorErrors).length > 0 && (
          <Alert
            message="Cảnh báo"
            description="Có lỗi trùng màu sắc trong một số phiên bản. Vui lòng kiểm tra và sửa lỗi trước khi tiếp tục."
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {totalDeletedVariants > 0 && (
          <Alert
            message={`Đã đánh dấu ${totalDeletedVariants} màu sắc để xóa`}
            description="Các màu sắc này sẽ bị xóa khi bạn lưu thay đổi."
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
                  title={`Màu sắc ${variantIndex + 1}${variant.id ? ` (ID: ${variant.id})` : ''}`}
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
                    name={['variants', optionIndex, variantIndex, 'id']}
                    hidden
                  >
                    <Input />
                  </Form.Item>

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
                    rules={[{ 
                      required: !variant.id || !variant.imageUrl, 
                      message: 'Vui lòng tải lên hình ảnh màu sắc!' 
                    }]}
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

                  {variant.id && variant.imageUrl && !variant.image && (
                    <div style={{ marginTop: 16, display: 'flex', alignItems: 'center' }}>
                      <Tag color="blue">Hình ảnh hiện tại</Tag>
                      <Image 
                        src={variant.imageUrl} 
                        width={100} 
                        height={100} 
                        style={{ objectFit: 'cover', marginLeft: 8 }}
                        alt={`Màu ${variant.color}`}
                      />
                    </div>
                  )}
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

// Step 4: Review and Submit
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
      
      // Thêm ID sản phẩm
      formDataObj.append("id", formData.productId);
      
      // Add basic product info
      formDataObj.append("name", formData.basicInfo.name);
      formDataObj.append("description", formData.basicInfo.description || '');
      formDataObj.append("categoryId", formData.basicInfo.categoryId);
      formDataObj.append("brandId", formData.basicInfo.brandId);
      
      // Add image delete IDs if any
      if (Array.isArray(formData.imageDeleteIds) && formData.imageDeleteIds.length > 0) {
        formData.imageDeleteIds.forEach(id => {
          formDataObj.append("imageDeleteIds", id);
        });
      }
      
      // Add deleted option IDs if any
      if (Array.isArray(formData.deletedOptionIds) && formData.deletedOptionIds.length > 0) {
        formData.deletedOptionIds.forEach(id => {
          formDataObj.append("deletedOptionIds", id);
        });
      }
      
      // Add new product thumbnail images
      if (formData.basicInfo.newImages && formData.basicInfo.newImages.length > 0) {
        formData.basicInfo.newImages.forEach(image => {
          if (image.originFileObj) {
            formDataObj.append("imageThumbnails", image.originFileObj);
          }
        });
      }
      
      // Prepare options and variants - lọc bỏ các options đã bị đánh dấu xóa
      const activeOptions = Array.isArray(formData.options) ? formData.options.filter(option => 
        !Array.isArray(formData.deletedOptionIds) || !formData.deletedOptionIds.includes(option.id)
      ) : [];
      
      activeOptions.forEach((option, optionIndex) => {
        const optionKey = `options[${optionIndex}]`;
        
        // Thêm ID nếu là option đã tồn tại
        if (option.id) {
          formDataObj.append(`${optionKey}.id`, option.id);
        }
        
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
        
        // Thêm danh sách variant bị xóa nếu có
        const optionId = option.id;
        if (formData.deletedVariantIds && formData.deletedVariantIds[optionId] && formData.deletedVariantIds[optionId].length > 0) {
            console.log('Deleted variant IDs:', formData.deletedVariantIds[optionId]);
          formData.deletedVariantIds[optionId].forEach(variantId => {
            formDataObj.append(`${optionKey}.deletedVariantIds`, variantId);
          });
        }
        
        // Thêm thông tin về variants
        const optionVariants = formData.variants[optionIndex] || [];
        optionVariants.forEach((variant, variantIndex) => {
          const variantKey = `${optionKey}.variants[${variantIndex}]`;
          
          // Thêm ID nếu là variant đã tồn tại
          if (variant.id) {
            formDataObj.append(`${variantKey}.id`, variant.id);
          }
          
          formDataObj.append(`${variantKey}.color`, variant.color);
          formDataObj.append(`${variantKey}.priceDiff`, variant.priceDiff || 0);
          formDataObj.append(`${variantKey}.stock`, parseInt(variant.stock) || 0);
          
          // Thêm hình ảnh cho variant nếu có
          if (variant.image && variant.image[0] && variant.image[0].originFileObj) {
            formDataObj.append(`${variantKey}.image`, variant.image[0].originFileObj);
          }
        });
      });
      
      // Gửi đến API thông qua Redux action
      const response = await dispatch(adminUpdateProduct( formData.productId, formDataObj));
      console.log('Response:', response);

      if (response === 200) {
        notification.success({
          message: 'Thành công',
          description: 'Cập nhật thành công',
          placement: 'topRight',
        });

        onSubmit();

        setTimeout(() => {
          navigate('/admin/laptops');
        }, 1000);
      } else {
        notification.error({
          message: 'Lỗi',
          description: 'Cập nhật sản phẩm thất bại!',
          placement: 'topRight',
        });
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật sản phẩm:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Cập nhật sản phẩm thất bại!',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  // Lọc các option đã bị đánh dấu xóa
  const activeOptions = Array.isArray(formData.options) ? formData.options.filter(option => 
    !Array.isArray(formData.deletedOptionIds) || !formData.deletedOptionIds.includes(option.id)
  ) : [];

  return (
    <div>
      <Card title="Xem lại thông tin sản phẩm" bordered={false}>
        <Descriptions title="Thông tin cơ bản" bordered column={2}>
          <Descriptions.Item label="ID sản phẩm">{formData.productId}</Descriptions.Item>
          <Descriptions.Item label="Tên sản phẩm">{formData.basicInfo.name}</Descriptions.Item>
          <Descriptions.Item label="Danh mục">
            {formData.basicInfo.categoryId}
          </Descriptions.Item>
          <Descriptions.Item label="Thương hiệu">
            {formData.basicInfo.brandId}
          </Descriptions.Item>
          
          <Descriptions.Item label="Hình ảnh giữ lại">
            {formData.basicInfo.existingImageIds?.length || 0} ảnh
          </Descriptions.Item>
          <Descriptions.Item label="Hình ảnh mới">
            {formData.basicInfo.newImages?.length || 0} ảnh
          </Descriptions.Item>

          <Descriptions.Item label="Hình ảnh bị xóa" span={2}>
            {Array.isArray(formData.imageDeleteIds) ? formData.imageDeleteIds.length : 0} ảnh
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

        {Array.isArray(formData.deletedOptionIds) && formData.deletedOptionIds.length > 0 && (
          <Alert
            message={`${formData.deletedOptionIds.length} phiên bản sẽ bị xóa`}
            description="Các phiên bản đã bị đánh dấu xóa không hiển thị ở đây."
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Collapse defaultActiveKey={['0']}>
          {activeOptions.map((option, index) => {
            // Kiểm tra xem option này có variant bị xóa không
            const hasDeletedVariants = 
              formData.deletedVariantIds && 
              formData.deletedVariantIds[option.id] && 
              formData.deletedVariantIds[option.id].length > 0;
              
            return (
              <Panel 
                header={`Phiên bản ${index + 1}: ${option.code || 'Chưa đặt tên'}`} 
                key={index}
                extra={
                  <Space>
                    {option.id && <Tag color="blue">ID: {option.id}</Tag>}
                    <Tag color="green">{option.price ? `${option.price}đ` : 'Chưa có giá'}</Tag>
                  </Space>
                }
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
                
                {hasDeletedVariants && (
                  <Alert
                    message={`${formData.deletedVariantIds[option.id].length} màu sắc sẽ bị xóa`}
                    description="Các màu sắc đã bị đánh dấu xóa không hiển thị ở đây."
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                )}
                
                <Row gutter={16}>
                  {formData.variants[index]?.map((variant, vIndex) => {
                    // Bỏ qua hiển thị các variant đã bị đánh dấu xóa
                    if (option.id && 
                        formData.deletedVariantIds && 
                        formData.deletedVariantIds[option.id] && 
                        formData.deletedVariantIds[option.id].includes(variant.id)) {
                      return null;
                    }
                    
                    return (
                      <Col span={8} key={vIndex}>
                        <Card 
                          title={`Màu sắc ${vIndex + 1}: ${variant.color}`}
                          style={{ marginBottom: 16 }}
                          extra={variant.id && <Tag color="blue">ID: {variant.id}</Tag>}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                            {variant.image && variant.image[0] && (
                              <Avatar 
                                src={variant.image[0].url || variant.image[0].thumbUrl || 
                                  (variant.image[0].originFileObj && URL.createObjectURL(variant.image[0].originFileObj))} 
                                shape="square"
                                size={64}
                                style={{ marginRight: 16 }}
                              />
                            )}
                            {!variant.image && variant.imageUrl && (
                              <Avatar 
                                src={variant.imageUrl} 
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
                    );
                  })}
                </Row>
              </Panel>
            );
          })}
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
            Cập nhật
          </Button>
        </Space>
      </div>
    </div>
  );
};

// Main Wizard Component
const UpdateProductWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    productId: null,
    basicInfo: {},
    options: [],
    variants: {},
    imageDeleteIds: [],
    deletedOptionIds: [],
    deletedVariantIds: {}
  });
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const dispatch = useDispatch();
  const notification = useContext(NotificationContext);
  const [form1] = Form.useForm();
  const [form2] = Form.useForm();
  const [form3] = Form.useForm();

  // Lấy thông tin sản phẩm khi component được tải
  useEffect(() => {
    if (id) {
      fetchProductData(id);
    }
  }, [id]);

  // Hàm lấy thông tin sản phẩm
  const fetchProductData = async (productId) => {
    try {
      setLoading(true);
      const productData = await dispatch(adminDetailProduct(productId));

      if (productData) {
        // Chuẩn bị dữ liệu cho form
        const basicInfo = {
          name: productData.name,
          description: productData.description,
          categoryId: productData.category.id,
          brandId: productData.brand.id,
          images: productData.images || [],
        };

        // Đặt dữ liệu vào formData
        setFormData({
          productId: productData.id,
          basicInfo: basicInfo,
          options: productData.options || [],
          variants: {},
          imageDeleteIds: [],
          deletedOptionIds: [],
          deletedVariantIds: {}
        });

        // Đặt dữ liệu vào form
        form1.setFieldsValue(basicInfo);
      } else {
        notification.error({
          message: 'Lỗi',
          description: 'Không thể tải thông tin sản phẩm',
          placement: 'topRight',
        });
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu sản phẩm:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Đã xảy ra lỗi khi tải thông tin sản phẩm',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset form values when navigating between steps to ensure data persistence
  useEffect(() => {
    if (currentStep === 0) {
      form1.setFieldsValue(formData.basicInfo);
    } else if (currentStep === 1) {
      // Đảm bảo rằng deletedOptionIds là một mảng trước khi sử dụng filter
      const safeDeletedOptionIds = Array.isArray(formData.deletedOptionIds) ? formData.deletedOptionIds : [];
      const optionsToShow = formData.options.filter(
        option => !safeDeletedOptionIds.includes(option.id)
      );
      form2.setFieldsValue({ options: optionsToShow });
    } else if (currentStep === 2) {
      form3.setFieldsValue({ variants: formData.variants });
    }
  }, [currentStep, formData, form1, form2, form3]);

  // Hàm xử lý thêm ảnh vào danh sách xóa
  const handleDeleteImage = (imageId) => {
    setFormData(prev => ({
      ...prev,
      imageDeleteIds: Array.isArray(prev.imageDeleteIds) ? [...prev.imageDeleteIds, imageId] : [imageId]
    }));
  };

  // Hàm xử lý quay lại bước trước đó với bảo toàn dữ liệu
  const handleBack = (fromStep, additionalData = {}) => {
    // Lưu dữ liệu của bước hiện tại trước khi quay lại
    if (fromStep === 2) {
      // Lưu dữ liệu từ bước Options về BasicInfo
      setFormData(prev => ({
        ...prev,
        options: additionalData.options || prev.options,
        deletedOptionIds: Array.isArray(additionalData.deletedOptionIds) ? additionalData.deletedOptionIds : prev.deletedOptionIds
      }));
    } else if (fromStep === 3) {
      // Lưu dữ liệu từ bước Variants về Options
      setFormData(prev => ({
        ...prev,
        variants: additionalData.variants || prev.variants,
        deletedVariantIds: additionalData.deletedVariantIds || prev.deletedVariantIds,
        deletedOptionIds: Array.isArray(additionalData.deletedOptionIds) ? additionalData.deletedOptionIds : prev.deletedOptionIds
      }));
    }
    
    // Quay lại bước trước
    setCurrentStep(fromStep - 1);
  };

  // Hàm xử lý chuyển sang bước tiếp theo
  const handleNext = (stepIndex, data) => {
    if (stepIndex === 0) {
      // Từ BasicInfo sang Options
      setFormData(prev => ({
        ...prev,
        basicInfo: data
      }));
      setCurrentStep(1);
    } else if (stepIndex === 1) {
      // Từ Options sang Variants
      setFormData(prev => {
        return {
          ...prev,
          options: data.options,
          deletedOptionIds: Array.isArray(data.deletedOptionIds) ? data.deletedOptionIds : prev.deletedOptionIds
        };
      });
      setCurrentStep(2);
    } else if (stepIndex === 2) {
      // Từ Variants sang Review
      setFormData(prev => ({
        ...prev,
        variants: data.variants,
        deletedVariantIds: data.deletedVariantIds || prev.deletedVariantIds,
        deletedOptionIds: Array.isArray(data.deletedOptionIds) ? data.deletedOptionIds : prev.deletedOptionIds
      }));
      setCurrentStep(3);
    }
  };

  // Danh sách các bước
  const steps = [
    {
      title: 'Thông tin cơ bản',
      content: (
        <BasicInfoStep 
          form={form1} 
          onNext={(data) => handleNext(0, data)}
          initialValues={formData.basicInfo}
          existingImages={formData.basicInfo.images}
          onDeleteImage={handleDeleteImage}
        />
      ),
      icon: <UploadOutlined />
    },
    {
      title: 'Phiên bản laptop',
      content: (
        <OptionsStep 
          form={form2}
          onNext={(data) => handleNext(1, data)}
          onBack={() => handleBack(1)}
          initialValues={formData}
          deletedOptionIds={formData.deletedOptionIds}
          setDeletedOptionIds={(newDeletedIds) => 
            setFormData(prev => ({ 
              ...prev, 
              deletedOptionIds: Array.isArray(newDeletedIds) ? newDeletedIds : [] 
            }))
          }
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
        // Đảm bảo dữ liệu deletedVariantIds được truyền đúng
        console.log('Dữ liệu variants khi Next:', data.variants);
        console.log('Dữ liệu deletedVariantIds khi Next:', data.deletedVariantIds);
        handleNext(2, data);
      }}
      onBack={(data) => handleBack(2, data)}
      initialValues={{
        ...formData,
        options: formData.options.filter(
          option => !Array.isArray(formData.deletedOptionIds) || !formData.deletedOptionIds.includes(option.id)
        )
      }}
      deletedVariantIds={formData.deletedVariantIds || {}}
      setDeletedVariantIds={(newDeletedIds) => {
        console.log('Cập nhật deletedVariantIds ở component cha:', newDeletedIds);
        setFormData(prev => ({ ...prev, deletedVariantIds: newDeletedIds }));
      }}
      deletedOptionIds={formData.deletedOptionIds}
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
              productId: null,
              basicInfo: {},
              options: [],
              variants: {},
              imageDeleteIds: [],
              deletedOptionIds: [],
              deletedVariantIds: {}
            });
            setCurrentStep(0);
          }}
          onBack={() => handleBack(3)}
        />
      ),
      icon: <CheckOutlined />
    }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spin size="large" tip="Đang tải dữ liệu sản phẩm..." />
      </div>
    );
  }

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

// Main Page Component
const UpdateProduct = () => {
  const { id } = useParams();
  
  if (!id) {
    return (
      <div style={{ padding: 24 }}>
        <Alert 
          message="Lỗi"
          description="Không tìm thấy ID sản phẩm. Vui lòng quay lại danh sách sản phẩm và chọn sản phẩm cần cập nhật."
          type="error"
          showIcon
        />
      </div>
    );
  }
  
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 24 }}>Cập nhật sản phẩm #{id}</h1>
      <UpdateProductWizard />
    </div>
  );
};

export default UpdateProduct;