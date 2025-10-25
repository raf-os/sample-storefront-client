// Just some experimentation

// Helpers for endpoint mapping

import GlobalConfig from "@/lib/globalConfig";

const PolicyConfigs = {
    IsAuthorized: 1 << 0,
    IsMod: 1 << 1,
    IsAdmin: 1 << 2
}

const HttpMethods = {
    GET: 1 << 0,
    POST: 1 << 1,
    PUT: 1 << 2,
    PATCH: 1 << 3,
    DELETE: 1 << 4
}

interface IEndpoint {
    children?: IEndpoint[],
    route: string,
    policies?: number,
    methods?: number
}

const Mapping: IEndpoint[] = [{
    route: "auth",
    children: [{
        route: "login",
        methods: HttpMethods.POST
    }, {
        route: "refresh",
        methods: HttpMethods.POST
    }, {
        route: "register",
        methods: HttpMethods.POST
    }]
}];

const NodeTypes = {
    Root: Symbol(),
    Route: Symbol()
}

class EndpointMap {
    private _nodeMap: { [key: string | symbol]: EndpointNode } = {};
    private _map: IEndpoint[];

    constructor(map: IEndpoint[]) {
        this._map = map;

        const rootNode = new EndpointNode(map);
        rootNode.__typeof = NodeTypes.Root;
        this._nodeMap[NodeTypes.Root] = rootNode;
    }

    public Build() {};
}

class EndpointNode {
    /** INTERNAL USE ONLY */
    __typeof: symbol = NodeTypes.Route;
    private _map?: IEndpoint[];
    children?: EndpointNode[];

    constructor(map?: IEndpoint[]) {
        this._map = map;
    }
}