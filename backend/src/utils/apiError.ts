class ApiError extends Error{
    constructor(
        public statuscode:number,
        public message:string="something went wrong",
        public success:boolean,
        public errors ?: string[],
        public stack ?:string,
    ){
        super(message);
        this.statuscode = statuscode;
        this.message = message;
        this.success = success;
        this.errors = errors;
        if(stack)this.stack = stack;
        else Error.captureStackTrace(this,this.constructor)
    }
}

export {ApiError}