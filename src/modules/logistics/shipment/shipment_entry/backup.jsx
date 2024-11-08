import React, {useMemo, useState} from 'react';
import {Box, Grid, Grow, Paper} from '@mui/material';
import WelcomeSection from '../../../../components/WelcomeSection.jsx';
import {tabItems} from './ShipmentEntryUtil.jsx';
import {Typography} from '@mui/material';
import {Button, Col, DatePicker, Divider, Form, Input, InputNumber, Row} from 'antd';
import TemporarySection from "../../../../components/TemporarySection.jsx";
import {DownSquareOutlined} from "@ant-design/icons";

const ShipmentEntryPage = () => {
    const [activeTabKey, setActiveTabKey] = useState('1');
    const [form] = Form.useForm();

    const handleTabChange = (key) => {
        setActiveTabKey(key);
    };

    const handleSubmit = form => {

    };

    return (
        <Box sx={{margin: '20px'}}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <WelcomeSection
                        title="출하입력"
                        description={(
                            <Typography>
                                출하입력 페이지는 <span>출하지시서에 따라 실제로 상품을 출하하는 과정</span>을 관리하는 곳임. 이 페이지에서는 <span>출하 내역을 입력하고, 출하 품목, 수량, 출하일</span> 등을
                                기록할 수 있음.
                            </Typography>
                        )}
                        tabItems={tabItems()}
                        activeTabKey={activeTabKey}
                        handleTabChange={handleTabChange}
                    />
                </Grid>
            </Grid>

            {activeTabKey === '1' && (
                <Grid sx={{padding: '0px 20px 0px 20px'}} container spacing={3}>
                    <Grid item xs={12} md={5} sx={{minWidth: '1000px !important', maxWidth: '1500px !important'}}>
                        <Grow in={true} timeout={200}>
                            <Paper elevation={3} sx={{height: '100%'}}>
                                <Typography variant="h6" sx={{padding: '20px'}}>출하 입력</Typography>
                                <Grid sx={{padding: '0px 20px 0px 20px'}}>
                                    <Form layout="vertical" onFinish={handleSubmit}>
                                        <Divider orientation={'left'} orientationMargin="0"
                                                 style={{marginTop: '0px', fontWeight: 600}}>기초 정보</Divider>
                                        <Row gutter={16}>
                                            <Col>
                                                <Typography>출하일자</Typography>
                                            </Col>
                                            <Col span={3}>
                                                <Form.Item name="shipmentDate"
                                                           rules={[{required: true, message: '출하 일자를 선택하세요.'}]}>
                                                    <DatePicker style={{width: '100%'}}/>
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                {/* Client ID */}
                                                <Form.Item name="clientId">
                                                    <Input placeholder="고객 ID" addonBefore="거래처"/>
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item name="employeeId"
                                                           rules={[{required: true, message: '담당자 ID를 입력하세요.'}]}>
                                                    <Input placeholder="담당자 ID" addonBefore="담당자"/>
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item name="warehouseId"
                                                           rules={[{required: true, message: '창고 ID를 입력하세요.'}]}>
                                                    <Input placeholder="창고 ID" addonBefore="창고명"/>
                                                </Form.Item>
                                            </Col>
                                            <Col span={5}>
                                                <Form.Item name="contactInfo">
                                                    <Input placeholder="고객 연락처" addonBefore="연락처"/>
                                                </Form.Item>
                                            </Col>
                                            <Col span={8}>
                                                <Form.Item name="address">
                                                    <Input placeholder="창고 주소" addonBefore="주소"/>
                                                </Form.Item>
                                            </Col>
                                            <Col span={11}>
                                                <Form.Item name="comment">
                                                    <Input placeholder="비고 입력" addonBefore="비고"/>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Divider orientation={'left'} orientationMargin="0"
                                                 style={{marginTop: '0px', fontWeight: 600}}>출하 품목 정보</Divider>
                                        {/* Products List */}
                                        <Form.List name="products">
                                            {(fields, {add, remove}) => (
                                                <>
                                                    {fields.map(({key, name, ...restField}, index) => (
                                                        <Row gutter={16} key={key}
                                                             style={{marginBottom: '10px'}}>
                                                            <Col span={6}>
                                                                <Form.Item
                                                                    {...restField}
                                                                    name={[name, 'productCode']}
                                                                    required
                                                                    tooltip="품목 코드를 입력하세요"
                                                                >
                                                                    <Input
                                                                        addonBefore="품목 코드"
                                                                        value={null}
                                                                        onClick={() => handleInputClick('productCode', index)}
                                                                        onFocus={(e) => e.target.blur()}
                                                                        suffix={<DownSquareOutlined/>}
                                                                    />
                                                                </Form.Item>
                                                                <Form.Item
                                                                    {...restField}
                                                                    name={[name, 'productId']}
                                                                    hidden
                                                                >
                                                                    <Input/>
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={6}>
                                                                <Form.Item
                                                                    {...restField}
                                                                    name={[name, 'productName']}
                                                                    required
                                                                    tooltip="품목명을 입력하세요"
                                                                >
                                                                    <Input addonBefore="품목명"/>
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={3}>
                                                                <Form.Item
                                                                    {...restField}
                                                                    name={[name, 'standard']}
                                                                >
                                                                    <Input addonBefore="규격"/>
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={3}>
                                                                <Form.Item
                                                                    {...restField}
                                                                    name={[name, 'unit']}
                                                                >
                                                                    <Input addonBefore="단위"/>
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={4}>
                                                                <Form.Item
                                                                    {...restField}
                                                                    name={[name, 'quantity']}
                                                                    required
                                                                    tooltip="수량을 입력하세요"
                                                                >
                                                                    <InputNumber addonBefore="수량"/>
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={2} style={{
                                                                display: 'flex',
                                                                justifyContent: 'flex-end'
                                                            }}>
                                                                <Button type="danger" onClick={() => remove(name)}>삭제</Button>
                                                            </Col>
                                                        </Row>
                                                    ))}
                                                    <Form.Item>
                                                        <Button type="primary" onClick={() => add()} block>
                                                            항목 추가
                                                        </Button>
                                                    </Form.Item>
                                                </>
                                            )}
                                        </Form.List>

                                        {/* Submit Button */}
                                        <Form.Item>
                                            <Button type="primary" htmlType="submit">
                                                출하 생성
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                </Grid>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>
            )}

            {activeTabKey === '2' && (
                <Grid sx={{padding: '0px 20px 0px 20px'}} container spacing={3}>
                    <Grid item xs={12} md={5} sx={{minWidth: '500px !important', maxWidth: '700px !important'}}>
                        <Grow in={true} timeout={200}>
                            <div>
                                <TemporarySection/>
                            </div>
                        </Grow>
                    </Grid>
                </Grid>
            )}

        </Box>
    );
};

export default ShipmentEntryPage;