import React from 'react';
import {Skeleton} from 'antd';
import {Box} from "@mui/material";

// antd의 Skeleton 컴포넌트를 사용하여 MUI의 스켈레톤과 유사한 형태로 설정
function AntdSkeleton() {
    return (
        <>
        <Skeleton
            active
            paragraph={{
                rows: 3, // 3개의 가로줄을 생성
                width: ['80%', '60%', '40%'], // 각각의 가로줄 너비를 다르게 설정
            }}
            title={{ width: '60%' }} // 제목 스켈레톤의 너비를 설정
            style={{
                width: '100%', // 카드의 너비 설정
                height: '30%', // 카드의 높이 설정
                padding: '24px', // 카드 내의 여백 설정
            }}
        />
        <Skeleton
            active
            paragraph={{
                rows: 4, // 3개의 가로줄을 생성
                width: ['80%', '50%', '30%', '20%'], // 각각의 가로줄 너비를 다르게 설정
            }}
            title={{ width: '60%' }} // 제목 스켈레톤의 너비를 설정
            style={{
                width: '100%', // 카드의 너비 설정
                height: '30%', // 카드의 높이 설정
                padding: '24px', // 카드 내의 여백 설정
            }}
        />
            <Skeleton
                active
                paragraph={{
                    rows: 3, // 3개의 가로줄을 생성
                    width: ['80%', '60%', '40%'], // 각각의 가로줄 너비를 다르게 설정
                }}
                title={{ width: '60%' }} // 제목 스켈레톤의 너비를 설정
                style={{
                    width: '100%', // 카드의 너비 설정
                    height: '30%', // 카드의 높이 설정
                    padding: '24px', // 카드 내의 여백 설정
                }}
            />
        </>
    );
}

export default AntdSkeleton;