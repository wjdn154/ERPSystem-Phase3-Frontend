import React, {useEffect, useRef, useState} from 'react';
import {Grid,Paper,Typography}  from "@mui/material";
import {Button, Table as AntTable, Modal as AntModal, Input, Select, DatePicker} from "antd";
import {secondMaterialListColumn, materialHazardousListColumn, materialProductListColumn, productCodeColumn} from "./SecondMaterialListColumn.jsx"
const {Option} = Select;

const SecondMaterialListSection = ({
                                          data,
                                          handleRowSelection,
                                          materialDataDetail,
                                          handleInputChange,
                                          onMaterialRowClick,
                                          filteredProductData,
                                          filterHazardousData,
                                          handleDelete,
                                          onProductRowClick,
                                          handleDeleteProduct,
                                          handleProductRowSelection,
                                          handleProductInsertOk,
                                          handleHazardousInsertOk
                                      }) => {
    //품목 수정 모달 상태
    const [isInsertProductModalVisible, setIsInsertProductModalVisible] = useState(false);
    //유해물질 수정 모달 상태
    const [isInsertHazardousModalVisible, setIsInsertHazardousModalVisible] = useState(false); 

    //품목 등록 버튼 클릭 시 모달 창 띄우는 함수
    const insertProductModal = () => {
        setIsInsertProductModalVisible(true);
    };
    //유해물질 등록 버튼 클릭 시 모달 창 띄우는 함수
    const insertHazardousModal = () => {
        setIsInsertHazardousModalVisible(true);
    };
    //등록 취소 버튼 클릭 함수
    const handleProductInsertCancel = () => {
        setIsInsertProductModalVisible(false);
    }//등록 취소 버튼 클릭 함수
    const handleHazardousInsertCancel = () => {
        setIsInsertHazardousModalVisible(false);
    }
    return (
        <Grid container spacing={2}>
            {/*자재 목록 왼쪽에 배치*/}
            <Grid item xs={5}>
                <Paper elevation={3} sx={{height: '100%', p: 2, mr: 2}}>

                    <AntTable
                        style={{padding: '20px'}}
                        columns={secondMaterialListColumn}
                        dataSource={data}  //테이블에 표시할 데이터 배열
                        pagination={{
                            pageSize: 10,  //한 페이지에 표시할 데이터 개수
                            position: ['bottomCenter'],  //페이지네이션이 표시될 위치 지정 (테이블 아래 가운데)
                            showSizeChanger: false
                        }} //페지이 크기변경옵션 숨김
                        rowSelection={handleRowSelection}  //행선택 옵션
                        size="small"   //테이블 크기 설정
                        rowKey="id"   //각행에 고유한 키로 id 사용
                        onRow={(record) => ({
                            onClick: () => onMaterialRowClick(record),   //행 클릭 시 이벤트
                            style: {cursor: 'pointer'},           //커서 스타일 변경
                        })}
                    />

                </Paper>
            </Grid>

            {/*품목과 유해물질 리스트를 위아래로 배치*/}
            <Grid item xs={7}>
                <Grid container spacing={2} direction={'column'}>
                    {/*품목 리스트*/}
                    <Grid item>
                        <Paper elevation={3} sx={{p: 2}}>
                            <Typography>품목 목록</Typography>
                            <AntTable
                                style={{padding: '20px'}}
                                columns={materialProductListColumn}
                                dataSource={filteredProductData}
                                pagination={{pageSize: 5, position: ['bottomCenter'], showSizeChanger: false}}
                                rowSelection={handleProductRowSelection}
                                size="small"
                                rowKey="id"
                                onRow={(record) => ({
                                    onClick: () => onProductRowClick(record),   //행 클릭 시 이벤트
                                    style: {cursor: 'pointer'},           //커서 스타일 변경
                                })}
                            />
                            <div style={{display: 'flex', justifyContent: 'flex-end', marginRight: '20px'}}>
                                <Button onClick={insertProductModal} style={{marginRight: '10px'}}
                                        type="primary">추가</Button>
                                <Button onClick={handleDeleteProduct} type="danger">제거</Button>
                            </div>
                            <AntModal
                                title="품목 추가"
                                open={isInsertProductModalVisible}
                                onOk={handleProductInsertOk}
                                onCancel={handleProductInsertCancel}
                                width={800} // 너비를 700px로 설정
                            >
                                <div style={{display: 'flex', alignItems: 'center'}}>
                                    <Input value={"품목 코드"}
                                           style={{marginRight: '10px', flex: 1, backgroundColor: '#f6a6a6'}}
                                           readOnly/>
                                    <Input value={materialDataDetail.product?.productCode || ''}
                                           style={{marginRight: '30px', flex: 1}}
                                           //onClick={handleProductCodeClick}
                                           readOnly/>

                                    <Input value={"품목 명"}
                                           style={{marginRight: '10px', flex: 1, backgroundColor: '#f6a6a6'}}
                                           readOnly/>
                                    <Input value={materialDataDetail.product?.productName || ''} style={{flex: 1}}
                                           onChange={(e) => handleInputChange(e, 'productName')}/>
                                </div>

                                {/*<AntModal*/}
                                {/*    title={"품목 코드 선택"}*/}
                                {/*    open={isProductCodeModalVisible}*/}
                                {/*    onOk={handleProductCodeSelectOk}*/}
                                {/*    onCancel={handleProductCodeModalCancel}*/}
                                {/*    width={600}*/}
                                {/*>*/}
                                {/*    <AntTable*/}
                                {/*        style={{padding: '20px'}}*/}
                                {/*        columns={productCodeColumn}*/}
                                {/*        dataSource={productCodeData}*/}
                                {/*        pagination={{pageSize: 5, position: ['bottomCenter'], showSizeChanger: false}}*/}
                                {/*        rowSelection={handleProductRowSelection}*/}
                                {/*        size="small"*/}
                                {/*        rowKey="id"*/}
                                {/*        onRow={(record) => ({*/}
                                {/*            onClick: () => onProductCodeRowClick(record),*/}
                                {/*            style: {cursor: 'pointer'},*/}
                                {/*        })}*/}
                                {/*    >*/}

                                {/*    </AntTable>*/}
                                {/*</AntModal>*/}
                            </AntModal>
                        </Paper>
                    </Grid>


                    {/*유해물질 리스트*/}
                    <Grid item>
                        <Paper elevation={3} sx={{p: 2}}>
                            <Typography>유해물질 목록</Typography>
                            <AntTable
                                style={{padding: '20px'}}
                                columns={materialHazardousListColumn}
                                dataSource={filterHazardousData}
                                pagination={{pageSize: 5, position: ['bottomCenter'], showSizeChanger: false}}
                                rowSelection={handleRowSelection}
                                size="small"
                                rowKey="id"
                            />
                            <div style={{display: 'flex', justifyContent: 'flex-end', marginRight: '20px'}}>
                                <Button onClick={insertHazardousModal} style={{marginRight: '10px'}}
                                        type="primary">추가</Button>
                                <Button onClick={handleDelete} type="danger">제거</Button>
                            </div>
                            <AntModal
                                title="유해물질 추가"
                                open={isInsertHazardousModalVisible}
                                onOk={handleHazardousInsertOk}
                                onCancel={handleHazardousInsertCancel}
                                width={800} // 너비를 700px로 설정
                            >
                                <div style={{display: 'flex', alignItems: 'center'}}>
                                    <Input value={"유해물질 코드"}
                                           style={{marginRight: '10px', flex: 1, backgroundColor: '#f6a6a6'}}
                                           readOnly/>
                                    <Input value={materialDataDetail.hazardousMaterial?.hazardousMaterialCode || ''}
                                           style={{marginRight: '30px', flex: 1}}
                                           onChange={(e) => handleInputChange(e, 'hazardousMaterialCode')}/>
                                    <Input value={"유해물질 명"}
                                           style={{marginRight: '10px', flex: 1, backgroundColor: '#f6a6a6'}}
                                           readOnly/>
                                    <Input value={materialDataDetail.hazardousMaterial?.hazardousMaterialName || ''} style={{flex: 1}}
                                           onChange={(e) => handleInputChange(e, 'hazardousMaterialName')}/>
                                </div>
                            </AntModal>
                        </Paper>
                    </Grid>

                </Grid>
            </Grid>
        </Grid>
    )
}

export default SecondMaterialListSection;