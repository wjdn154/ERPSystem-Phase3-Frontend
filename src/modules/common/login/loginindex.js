// // index.js
// import { AuthProvider } from "react-oidc-context";
// import {App} from "antd";
//
// const cognitoAuthConfig = {
//     authority: "https://cognito-idp.ap-northeast-2.amazonaws.com/ap-northeast-2_217T3eJhC",
//     client_id: "2vbjbe8baqj88bmckgvag8klmt",
//     redirect_uri: "http://localhost:3000/callback",
//     response_type: "code",
//     scope: "email openid profile",
// };
//
// const root = ReactDOM.createRoot(document.getElementById("root"));
//
// // wrap the application with AuthProvider
// root.render(
//     <React.StrictMode>
//         <AuthProvider {...cognitoAuthConfig}>
//             <App />
//         </AuthProvider>
//     </React.StrictMode>
// );