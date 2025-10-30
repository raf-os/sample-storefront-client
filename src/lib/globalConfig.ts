const SERVER_ADDRESS = "https://localhost:7244";

const GlobalConfig = {
    AppTitle: "Storefront Sample",
    ServerAddr: SERVER_ADDRESS,
    ServerAuthEndpoint: SERVER_ADDRESS + "/auth",
    ServerProductEntpoint: SERVER_ADDRESS + "/api/product",
    ServerCommentEndpoint: SERVER_ADDRESS + "/api/comment",
    UserRoles: {
        User: "User",
        Operator: "Operator",
        Admin: "Admin"
    }
}

export default GlobalConfig;