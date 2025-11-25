const SERVER_ADDRESS = "https://localhost:7244";

const GlobalConfig = {
    AppTitle: "Storefront Sample",
    ServerAddr: SERVER_ADDRESS,
    ServerAuthEndpoint: SERVER_ADDRESS + "/auth",
    ServerProductEndpoint: SERVER_ADDRESS + "/api/product",
    ServerCommentEndpoint: SERVER_ADDRESS + "/api/comment",
    ServerCategoryEndpoint: SERVER_ADDRESS + "/api/category",
    UserRoles: {
        User: "User",
        Operator: "Operator",
        Admin: "Admin"
    },
    MaxImagesPerListing: 7
}

export default GlobalConfig;