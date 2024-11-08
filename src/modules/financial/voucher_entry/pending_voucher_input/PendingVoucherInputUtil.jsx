import {styled, Typography} from "@mui/material";
import {Button, Input, Popconfirm, Select} from "antd";
import React from "react";
import DebounceSelect from "../../../../components/DebounceSelect.jsx";
import apiClient from "../../../../config/apiClient.jsx";
import {COMMON_API, FINANCIAL_API} from "../../../../config/apiConstants.jsx";

export const tabItems = () => {
    return [
        {
            key: '1',
            label: '일반전표 입력',
            children: (
                <Typography>
                    미결전표 입력 페이지는 거래 내역을 입력하고 관리하는 기능을 제공합니다.
                    차변과 대변을 입력하여 대차 차액을 맞추고, 재무 기록을 관리할 수 있습니다.
                </Typography>
            ),
        },
    ];
};