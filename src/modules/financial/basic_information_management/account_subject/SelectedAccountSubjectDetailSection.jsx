import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Modal,
    TableContainer,
    Table as MuiTable,
    TableBody,
    TableRow,
    TableCell,
    Grid
} from '@mui/material';
import {Modal as AntModal, Divider, Button, Col, Form, Row, Input, Table as AntTable, Switch, Select} from "antd";
const { Option } = Select;
import {cashMemoColumn} from "./CashMemoColumn.jsx";
import {transferMemosColumn} from "./TransferMemosColumn.jsx";
import {FinancialStatementColumn} from "./FinancialStatementColumn.jsx";
import {RelationCodeColumn} from "./RelationCodeColumn.jsx";
import {NatureColumn} from "./NatureColumn.jsx";
import {fixedMemoColumn} from "./FixedMemoColumn.jsx";


const SelectedAccountSubjectDetailSection = ({
    data,
    accountSubjectDetail,
    handlePopupClick,
    isFinancialStatementModalVisible,
    isRelationCodeModalVisible,
    isNatureModalVisible,
    handleClose,
    selectFinancialStatement,
    handleInputChange,
    handleInputChange2,
    handleDeleteMemo,
    handleAddNewMemo,
    setAccountSubjectDetail,
    selectRelationCode,
    selectNature,
    handleSave,
    deleteRelationCode
}) => (
    <Paper elevation={3}>
        <Typography variant="h6" sx={{ padding: '20px' }} >계정과목 상세 내용</Typography>
        <Box sx={{ padding: '20px' }}>
            <Form layout="vertical">
                <Row gutter={16}>
                    {/*계정과목코드 / 계정과목명*/}
                    <Col span={12}>
                        <Form.Item
                            label="계정과목코드 / 계정과목명"
                            onClick={accountSubjectDetail.modificationType ? () => handlePopupClick('계정과목코드') : undefined}
                            style={{ marginBottom: '40px' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Input value={accountSubjectDetail.code} style={{ marginRight: '10px', flex: 1, backgroundColor: '#f6a6a6 !important' }} readOnly />
                                <Input value={accountSubjectDetail.name} style={{ flex: 1 }} onChange={(e) => handleInputChange(e, 'name')} readOnly={!accountSubjectDetail.modificationType} />
                            </div>
                        </Form.Item>
                    </Col>
                    {/*성격코드 / 성격*/}
                    <Col span={12}>
                        <Form.Item
                            label="성격코드 / 성격"
                            onClick={accountSubjectDetail.modificationType ? () => handlePopupClick('성격') : undefined}
                            style={{ marginBottom: '40px' }}
                        >
                            <div className={'input-wrapper'} style={{ display: 'flex', alignItems: 'center' }}>
                                <Input className={'input-field'} value={accountSubjectDetail.natureCode} style={{ marginRight: '10px', flex: 1 }} readOnly={!accountSubjectDetail.modificationType}/>
                                <Input className={'input-field'} value={accountSubjectDetail.natureName} style={{ flex: 1 }} readOnly={!accountSubjectDetail.modificationType}/>
                            </div>
                        </Form.Item>
                    </Col>
                    <AntModal
                        open={isNatureModalVisible}
                        onCancel={handleClose}
                        footer={null}
                        centered
                        width="40vw"
                    >
                        <Typography id="modal-modal-title" variant="h6" component="h2">
                            계정과목 성격 선택
                        </Typography>

                        {/* antd Table 사용 */}
                        <AntTable
                            columns={NatureColumn()}
                            dataSource={data.accountSubjectDetail.natures}
                            rowKey="code"
                            size={'small'}
                            pagination={{ pageSize: 10, position: ['bottomCenter'], showSizeChanger: false }}
                            onRow={(record) => ({
                                style: { cursor: 'pointer' },
                                onClick: () => {
                                    selectNature(record);
                                    handleClose();
                                },
                            })}
                            locale={{
                                emptyText: '데이터가 없습니다.',
                            }}
                            style={{ marginTop: 16 }}
                        />

                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button onClick={deleteRelationCode} variant="contained" type="danger" style={{ marginRight: '20px' }} sx={{ mr: 1 }}>
                                삭제
                            </Button>
                            <Button onClick={handleClose} variant="contained" type="danger" sx={{ mr: 1 }}>
                                닫기
                            </Button>
                        </Box>
                    </AntModal>
                </Row>
                <Row gutter={16}>
                    {/*관계명 / 관계코드*/}
                    <Col span={12}>
                        <Form.Item
                            label="관계명 / 관계코드"
                            onClick={accountSubjectDetail.modificationType ? () => handlePopupClick('관계코드') : undefined}
                            style={{ marginBottom: '40px' }}
                        >
                            <div className={'input-wrapper'} style={{display: 'flex', alignItems: 'center'}}>
                                    <Input className={'input-field'} value={accountSubjectDetail.parentCode || '없음'}
                                           style={{marginRight: '10px', flex: 1}}
                                           readOnly={!accountSubjectDetail.modificationType}/>
                                    <Input className={'input-field'} value={accountSubjectDetail.parentName || '없음'}
                                           style={{flex: 1}} readOnly={!accountSubjectDetail.modificationType}/>
                            </div>
                        </Form.Item>
                    </Col>
                    <AntModal
                        open={isRelationCodeModalVisible}
                        onCancel={handleClose}
                        footer={null}
                        centered
                        width="40vw"
                    >
                        <Typography id="modal-modal-title" variant="h6" component="h2">
                            관계 코드 선택
                        </Typography>

                        {/* antd Table 사용 */}
                        <AntTable
                            columns={RelationCodeColumn()}
                            dataSource={data.accountSubjects}
                            rowKey="code"
                            size={'small'}
                            pagination={{ pageSize: 10, position: ['bottomCenter'], showSizeChanger: false }}
                            onRow={(record) => ({
                                style: { cursor: 'pointer' },
                                onClick: () => {
                                    selectRelationCode(record);
                                    handleClose();
                                },
                            })}
                            style={{ marginTop: 16 }}
                        />

                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button onClick={deleteRelationCode} variant="contained" type="danger" style={{ marginRight: '20px' }} sx={{ mr: 1 }}>
                                삭제
                            </Button>
                            <Button onClick={handleClose} variant="contained" type="danger" sx={{ mr: 1 }}>
                                닫기
                            </Button>
                        </Box>
                    </AntModal>
                    {/*영문명*/}
                    <Col span={12}>
                        <Form.Item label="영문명" style={{ marginBottom: '40px' }}>
                            <Input value={accountSubjectDetail.englishName || ''} onChange={(e) => handleInputChange(e, 'englishName')} readOnly={!accountSubjectDetail.modificationType} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    {/*계정사용여부*/}
                    <Col span={12}>
                        <Form.Item
                            label="계정사용여부"
                            onClick={accountSubjectDetail.modificationType ? () => handlePopupClick('계정사용여부') : undefined}
                            style={{ marginBottom: '40px' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                {/* 현재 상태를 확인할 수 있는 Input */}
                                {!accountSubjectDetail.modificationType && (
                                    <Input
                                        value={accountSubjectDetail.isActive ? '여' : '부'}
                                        style={{ flex: 1, marginRight: '10px' }}
                                        readOnly
                                    />
                                )}
                                {/* 수정 가능한 Select */}
                                {accountSubjectDetail.modificationType && (
                                    <Select
                                        value={accountSubjectDetail.isActive}
                                        onChange={(value) => handleInputChange({ target: { value } }, 'isActive')}
                                        style={{ flex: 1 }}
                                    >
                                        <Option value={true}>여</Option>
                                        <Option value={false}>부</Option>
                                    </Select>
                                )}
                            </div>
                        </Form.Item>
                    </Col>
                    {/*계정수정구분*/}
                    <Col span={12}>
                        <Form.Item
                            label="계정수정구분"
                        >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Input value={accountSubjectDetail.modificationType ? '수정 가능' : '수정 불가'} style={{ flex: 1 }} readOnly />
                            </div>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    {/*표준재무제표명 / 표준재무제표코드*/}
                    <Col span={12}>
                        <Form.Item
                            label="표준재무제표명 / 표준재무제표코드"
                            onClick={accountSubjectDetail.modificationType ? () => handlePopupClick('표준재무제표') : undefined}
                            style={{ marginBottom: '40px' }}
                        >
                            <div className={'input-wrapper'} style={{ display: 'flex', alignItems: 'center' }}>
                                <Input
                                    className={'input-field'}
                                    value={accountSubjectDetail.standardFinancialStatementCode}
                                    style={{ marginRight: '10px', flex: 1 }}
                                    readOnly={!accountSubjectDetail.modificationType}
                                />
                                <Input
                                    className={'input-field'}
                                    value={accountSubjectDetail.standardFinancialStatementName}
                                    style={{ marginRight: '10px', flex: 1 }}
                                    readOnly={!accountSubjectDetail.modificationType}
                                />
                            </div>
                        </Form.Item>
                    </Col>
                    <AntModal
                        open={isFinancialStatementModalVisible}
                        onCancel={handleClose}
                        footer={null}
                        centered
                        width="40vw"
                    >
                        <Typography id="modal-modal-title" variant="h6" component="h2">
                            표준재무제표 선택
                        </Typography>


                        <Divider sx={{ backgroundColor: 'red !important' }}/>

                        <AntTable
                            columns={FinancialStatementColumn()}
                            dataSource={accountSubjectDetail.standardFinancialStatement}
                            rowKey="code"
                            size={'small'}
                            pagination={{ pageSize: 10, position: ['bottomCenter'], showSizeChanger: false }}
                            onRow={(record) => ({
                                style: { cursor: 'pointer' },
                                onClick: () => {
                                    selectFinancialStatement(record);
                                    handleClose();
                                },
                            })}
                            style={{ marginTop: 16 }}
                        />

                        <div style={{ marginTop: 16, textAlign: 'right' }}>
                            <Button onClick={handleClose} type="danger" style={{ marginRight: 8 }}>
                                닫기
                            </Button>
                        </div>
                    </AntModal>
                    {/*외화사용여부*/}
                    <Col span={12}>
                        <Form.Item
                            label="외화사용여부"
                            onClick={accountSubjectDetail.modificationType ? () => handlePopupClick('외화사용여부') : undefined}
                            style={{ marginBottom: '40px' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Input value={accountSubjectDetail.isForeignCurrency ? '여' : '부'} style={{ flex: 1 }} readOnly />
                            </div>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    {/*업무용차여부*/}
                    <Col span={12}>
                        <Form.Item
                            label="업무용차여부"
                            onClick={accountSubjectDetail.modificationType ? () => handlePopupClick('업무용차여부') : undefined}
                            style={{ marginBottom: '40px' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Input value={accountSubjectDetail.isBusinessCar ? '여' : '부'} style={{ flex: 1 }} readOnly />
                            </div>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>

            {/* 현금적요 테이블 */}
            <Box sx={{ mt: 1 }}>
                <Typography variant="h7" style={{ fontWeight: '600' }}>현금적요</Typography>
                <AntTable
                    rowKey="code"
                    pagination={false}
                    bordered={true}
                    size="small"
                    columns={cashMemoColumn(handleInputChange2, handleDeleteMemo, handleAddNewMemo, setAccountSubjectDetail, accountSubjectDetail).map(col => ({
                        ...col,
                        onCell: () => ({
                            style: { padding: '4px 8px' }  // 셀의 padding을 줄임
                        })
                    }))}
                    dataSource={
                        accountSubjectDetail.cashMemos
                    }
                    locale={{
                        emptyText: '데이터가 없습니다.',
                    }}
                />
            </Box>

            {/* 대체적요 테이블 */}
            <Box sx={{ mt: 1 }}>
                <Typography variant="h7" style={{ fontWeight: '600' }}>대체적요</Typography>
                <AntTable
                    rowKey="code"
                    pagination={false}
                    bordered={true}
                    size="small"
                    columns={transferMemosColumn(handleInputChange2, handleDeleteMemo, handleAddNewMemo, setAccountSubjectDetail, accountSubjectDetail).map(col => ({
                        ...col,
                        onCell: () => ({
                            style: { padding: '4px 8px' }  // 셀의 padding을 줄임
                        })
                    }))}
                    dataSource={
                        accountSubjectDetail.transferMemos
                    }
                    locale={{
                        emptyText: '데이터가 없습니다.',
                    }}
                />
            </Box>

            {/* 고정적요 테이블 */}
            <Box sx={{ mt: 1 }}>
                <Typography variant="h7" style={{ fontWeight: '600' }}>고정적요</Typography>
                <AntTable
                    rowKey="code"
                    pagination={false}
                    bordered={true}
                    size="small"
                    columns={fixedMemoColumn.map(col => ({
                        ...col,
                        onCell: () => ({
                            style: { padding: '4px 8px' }  // 셀의 padding을 줄임
                        })
                    }))}
                    dataSource={
                        accountSubjectDetail.fixedMemos
                    }
                    locale={{
                        emptyText: '데이터가 없습니다.',
                    }}
                />
            </Box>
        </Box>
        {accountSubjectDetail.modificationType && (
            <Box sx={{display: 'flex', justifyContent: 'flex-end', marginRight: '20px'}}>
                    <Button onClick={handleSave} type="primary" style={{ marginBottom: '20px' }} >
                        저장
                    </Button>
            </Box>
        )}
    </Paper>
);

export default SelectedAccountSubjectDetailSection;