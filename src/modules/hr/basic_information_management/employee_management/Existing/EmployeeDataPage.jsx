// // import React, { useMemo, useState } from 'react';
// // import { Button, Grid, Grow, Box } from '@mui/material';
// // import { EMPLOYEE_API } from '../../../config/apiConstants.jsx';
// // import axios from 'axios';
// // import { employeeDataHook } from '../hooks/EmployeeDataHook';
// // import EmployeeDataListSection from '../components/Employee/EmployeeDataListSection.jsx';
// // import { employeeDataListColumn } from '../utils/EmployeeData/EmployeeDataListColumn.jsx';
// // import EmployeeRegisterModal from '../components/Employee/EmployeeRegisterModal';
// // import EmployeeDetailModal from '../components/Employee/EmployeeDetailModal';
// //
// // const EmployeeDataPage = ({ initialData }) => {
// //     const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false); // 등록 모달 상태
// //     const [isDetailModalVisible, setIsDetailModalVisible] = useState(false); // 상세 모달 상태
// //     const [selectedEmployee, setSelectedEmployee] = useState(null); // 선택된 사원 상세 정보
// //     const [newEmployee, setNewEmployee] = useState({ name: '', age: '', department: '' }); // 신규 사원 정보
// //     const [selectedEmployeeId, setSelectedEmployeeId] = useState(null); // 선택된 사원 ID 상태
// //
// //     const {
// //         data,
// //         handleSelectedRow,
// //         handleRowSelection,
// //         setData
// //     } = employeeDataHook(initialData);
// //
// //     // 사원 상세 모달 열기
// //     const showDetailModal = async (employeeNumber) => {
// //         try {
// //             const response = await axios.get(`${EMPLOYEE_API.EMPLOYEE_DATA_DETAIL_API}/${employeeNumber}`);
// //             setSelectedEmployee(response.data); // 사원 상세 정보 설정
// //             setIsDetailModalVisible(true); // 상세 모달 열기
// //         } catch (error) {
// //             console.error('사원 정보를 불러오는 중 오류 발생:', error);
// //         }
// //     };
// //
// //     // 상세 모달 닫기
// //     const handleDetailCancel = () => {
// //         setIsDetailModalVisible(false);
// //         setSelectedEmployee(null); // 선택된 사원 초기화
// //     };
// //
// //     // 사원 등록 모달 열기/닫기
// //     const showRegisterModal = () => setIsRegisterModalVisible(true);
// //     const handleRegisterCancel = () => setIsRegisterModalVisible(false);
// //
// //     // 사원 삭제 핸들러
// //     const handleDeleteEmployee = async () => {
// //         if (!selectedEmployeeId) {
// //             message.warning('삭제할 사원을 선택해주세요.');
// //             return;
// //         }
// //
// //         try {
// //             await axios.delete(EMPLOYEE_API.DELETE_EMPLOYEE_DATA_API(selectedEmployeeId));
// //             message.success('사원이 성공적으로 삭제되었습니다.');
// //             const updatedData = await axios.get(EMPLOYEE_API.EMPLOYEE_DATA_API);
// //             setData(updatedData.data); // 상태 업데이트
// //             setSelectedEmployeeId(null); // 선택된 사원 초기화
// //         } catch (error) {
// //             console.error('사원 삭제 중 오류 발생:', error);
// //             message.error('사원 삭제 중 오류가 발생했습니다.');
// //         }
// //     };
// //
// //     return (
// //         <Box sx={{ flexGrow: 1, p: 3 }}>
// //             <Grid container spacing={2} sx={{ marginTop: 2 }}>
// //                 <Grid item xs={12}>
// //                     <Grow in={true} timeout={200}>
// //                         <div>
// //                             <EmployeeDataListSection
// //                                 columns={employeeDataListColumn(showDetailModal)}
// //                                 data={data}
// //                                 handleRowSelection={(selectedRowKeys) => setSelectedEmployeeId(selectedRowKeys[0])}
// //                                 handleSelectedRow={handleSelectedRow}
// //                             />
// //                         </div>
// //                     </Grow>
// //                 </Grid>
// //
// //                 {/* 사원 등록 및 삭제 버튼 */}
// //                 <Grid item xs={12}>
// //                     <Button type="primary" onClick={showRegisterModal}>
// //                         사원 등록
// //                     </Button>
// //                     <Button type="danger" onClick={handleDeleteEmployee} style={{ marginLeft: 8 }}>
// //                         사원 삭제
// //                     </Button>
// //                 </Grid>
// //             </Grid>
// //
// //             {/* 사원 등록 모달 */}
// //             <EmployeeRegisterModal
// //                 visible={isRegisterModalVisible}
// //                 onCancel={handleRegisterCancel}
// //                 newEmployee={newEmployee}
// //                 setNewEmployee={setNewEmployee}
// //                 setData={setData}
// //             />
// //
// //             {/* 사원 상세 모달 */}
// //             <EmployeeDetailModal
// //                 visible={isDetailModalVisible}
// //                 onCancel={handleDetailCancel}
// //                 employee={selectedEmployee}
// //             />
// //         </Box>
// //     );
// // };
// //
// // export default EmployeeDataPage;
//
//
// import React, { useMemo, useState } from 'react';
// import { Button, Grid, Grow, Box } from '@mui/material';
// import { EMPLOYEE_API } from '../../../config/apiConstants.jsx';
// import axios from 'axios';
// import { employeeDataHook } from '../hooks/EmployeeDataHook';
// import EmployeeDataListSection from '../components/Employee/EmployeeDataListSection.jsx';
// import { employeeDataListColumn } from '../utils/EmployeeData/EmployeeDataListColumn.jsx';
// import EmployeeRegisterModal from '../components/Employee/EmployeeRegisterModal';
// import EmployeeDetailModal from '../components/Employee/EmployeeDetailModal';
//
// const EmployeeDataPage = ({ initialData }) => {
//     const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false); // 등록 모달 표시 상태
//     const [isDetailModalVisible, setIsDetailModalVisible] = useState(false); // 상세 모달 표시 상태
//     const [selectedEmployee, setSelectedEmployee] = useState(null); // 선택된 사원의 상세 정보
//     const [newEmployee, setNewEmployee] = useState({ name: '', age: '', department: '' }); // 신규 사원 정보 상태
//     const [selectedEmployeeId, setSelectedEmployeeId] = useState(null); // 선택된 사원의 ID 상태
//
//     const employeeMemoizedData = useMemo(() => initialData, [initialData]);
//
//     const {
//         data,
//         handleSelectedRow,
//         handleRowSelection,
//         setData
//     } = employeeDataHook(initialData);
//
//     // 등록 모달 열기/닫기 핸들러
//     const showRegisterModal = () => setIsRegisterModalVisible(true);
//     const handleRegisterCancel = () => setIsRegisterModalVisible(false);
//
//     // 상세 모달 열기 핸들러 (사원번호 클릭 시 상세 정보 조회)
//     const showDetailModal = async (employeeNumber) => {
//         try {
//             const response = await axios.get(`${EMPLOYEE_API.EMPLOYEE_DATA_DETAIL_API}/${employeeNumber}`);
//             setSelectedEmployee(response.data); // 사원 상세 정보 설정
//             setIsDetailModalVisible(true); // 상세 모달 열기
//         } catch (error) {
//             console.error('Error fetching employee details:', error);
//         }
//     };
//
//     // 상세 모달 닫기 핸들러
//     const handleDetailCancel = () => {
//         setIsDetailModalVisible(false);
//         setSelectedEmployee(null); // 선택된 사원 초기화
//     };
//
//     // 사원 상세 정보 저장 핸들러
//     const handleSaveEmployee = async (updatedEmployee) => {
//         try {
//             // 업데이트 요청 전송
//             await axios.put(`${EMPLOYEE_API.UPDATE_EMPLOYEE_DATA_API}/${updatedEmployee.employeeNumber}`, updatedEmployee);
//             message.success('사원 정보가 성공적으로 수정되었습니다.');
//
//             // 수정된 데이터를 다시 불러와서 상태 업데이트
//             const updatedData = await axios.get(EMPLOYEE_API.EMPLOYEE_DATA_API);
//             setData(updatedData.data);
//
//             // 모달 닫기
//             setIsDetailModalVisible(false);
//         } catch (error) {
//             console.error('Error saving employee details:', error);
//         }
//     };
//
//     // 사원 삭제 핸들러
//     const handleDeleteEmployee = async () => {
//         if (!selectedEmployeeId) {
//             return;
//         }
//
//         try {
//             await axios.delete(EMPLOYEE_API.DELETE_EMPLOYEE_DATA_API(selectedEmployeeId));
//             const updatedData = await axios.get(EMPLOYEE_API.EMPLOYEE_DATA_API);
//             setData(updatedData.data); // 상태 업데이트
//             setSelectedEmployeeId(null); // 선택된 사원 초기화
//         } catch (error) {
//             console.error('사원 삭제 중 오류 발생:', error);
//         }
//     };
//
//     return (
//         <Box sx={{ flexGrow: 1, p: 3 }}>
//             <Grid container spacing={2} sx={{ marginTop: 2 }}>
//
//                 {/* 사원정보 리스트 영역 */}
//                 <Grid item xs={12}>
//                     <Grow in={true} timeout={200}>
//                         <div>
//                             <EmployeeDataListSection
//                                 columns={employeeDataListColumn(showDetailModal)} // 수정된 컬럼에서 showDetailModal 전달
//                                 data={data}
//                                 handleRowSelection={(selectedRowKeys) => setSelectedEmployeeId(selectedRowKeys[0])}
//                                 handleSelectedRow={handleSelectedRow}
//                             />
//                         </div>
//                     </Grow>
//                 </Grid>
//
//                 {/* 사원 등록 및 삭제 버튼 */}
//                 <Grid item xs={12}>
//                     <Button type="primary" onClick={showRegisterModal}>
//                         사원 등록
//                     </Button>
//                     <Button type="danger" onClick={handleDeleteEmployee} style={{ marginLeft: 8 }}>
//                         사원 삭제
//                     </Button>
//                 </Grid>
//
//             </Grid>
//
//             {/* 사원 등록 모달 */}
//             <EmployeeRegisterModal
//                 visible={isRegisterModalVisible}
//                 onCancel={handleRegisterCancel}
//                 newEmployee={newEmployee}
//                 setNewEmployee={setNewEmployee}
//                 setData={setData}
//             />
//
//             {/* 사원 상세 모달 */}
//             <EmployeeDetailModal
//                 visible={isDetailModalVisible}
//                 onCancel={handleDetailCancel}
//                 employee={selectedEmployee}
//                 onSave={handleSaveEmployee} // 저장 핸들러 전달
//             />
//         </Box>
//     );
// };
//
// export default EmployeeDataPage;


import React, {useCallback, useMemo, useState} from 'react';
import { Grid, Grow, Box } from '@mui/material';
import axios from 'axios';
import { EMPLOYEE_API } from '../../../../../../config/apiConstants.jsx';
import { employeeDataHook } from './EmployeeDataHook.jsx';
import EmployeeDataListSection from './EmployeeDataListSection.jsx';
import { employeeDataListColumn } from './EmployeeDataListColumn.jsx';
import EmployeeDetailModal from './EmployeeDetailModal.jsx';
import apiClient from "../../../../../../config/apiClient.jsx";

const EmployeeDataPage = ({ initialData }) => {
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false); // 상세 모달 표시 상태
    const [selectedEmployee, setSelectedEmployee] = useState(null); // 선택된 사원의 상세 정보

    const employeeMemoizedData = useMemo(() => initialData, [initialData]);

    // 데이터 훅 사용
    const {
        data,
        handleSelectedRow,
        handleRowSelection,
        setData
    } = employeeDataHook(initialData);

    // 사원 번호 클릭 시 상세 정보 조회하여 모달 열기
    const showDetailModal = useCallback(async (id) => {
        try{
            console.log(id);
            // 상태가 렌더링 중에 계속해서 설정되지 않도록 하는 로직
            if (!id) return;  // employeeNumber가 없는 경우 무시

            const response = await apiClient.get(EMPLOYEE_API.EMPLOYEE_DATA_DETAIL_API(id));
            console.log('response: ', response.data);
            setSelectedEmployee(response.data) // 사원 상세 정보 설정
            setIsDetailModalVisible(true); // 상세 모달 열기
        } catch(error){
            console.error('에러 발생', error);
        }
    },[]); // 의존성 배열을 빈 값으로 설정하여 함수가 재생성되지 않도록 설정

    // 상세 모달 닫기 핸들러
    const handleDetailCancel = useCallback(() => {
        setIsDetailModalVisible(false);
        setSelectedEmployee(null); // 선택된 사원 초기화
    },[]);

    // 수정된 사원 정보 저장
    const handleSaveEmployee = useCallback(async (updatedEmployee) => {
        // console.log('전송할 데이터: ', updatedEmployee);  // 데이터 확인
        // // 업데이트 요청을 서버로 전송
        // await axios.put(`${EMPLOYEE_API.UPDATE_EMPLOYEE_DATA_API}`, updatedEmployee);
        // console.log(`${EMPLOYEE_API.UPDATE_EMPLOYEE_DATA_API}`)
        // API 경로를 출력해서 확인
        const apiUrl = EMPLOYEE_API.UPDATE_EMPLOYEE_DATA_API(updatedEmployee.id);
        console.log('전송할 데이터: ', updatedEmployee);
        console.log('API URL: ', apiUrl);  // API URL 확인

        // 업데이트 요청을 서버로 전송
        await apiClient.put(apiUrl, updatedEmployee);
        // 성공 시 상태 업데이트 (리스트 갱신)
        const updatedData = await apiClient.get(EMPLOYEE_API.EMPLOYEE_DATA_API);
        try {
            setData(updatedData.data); // 전체 리스트 갱신
            setIsDetailModalVisible(false); // 모달 닫기
        } catch (error) {
            console.error('사원 정보 저장 중 오류 발생:', error);
        }
    }, [setData]);

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Grid container spacing={2} sx={{ marginTop: 2 }}>
                {/* 사원정보 리스트 영역 */}
                <Grid item xs={12}>
                    <Grow in={true} timeout={200}>
                        <div>
                            <EmployeeDataListSection
                                columns={employeeDataListColumn(showDetailModal)} // 컬럼 구성
                                data={employeeMemoizedData} // 사원 리스트 데이터
                                handleRowSelection={(selectedRowKeys) => setSelectedEmployee(selectedRowKeys[0])}
                                handleSelectedRow={handleSelectedRow} // 선택된 사원 처리
                            />
                        </div>
                    </Grow>
                </Grid>

            </Grid>
            {/* 사원 상세 모달 */}
            <EmployeeDetailModal
                visible={isDetailModalVisible}
                onCancel={handleDetailCancel}
                employee={selectedEmployee}
                onSave={handleSaveEmployee}/>
        </Box>
    );
};

export default EmployeeDataPage;