class ApiFeatures{
    constructor(query, queryStr){
        this.query = query;
        this.queryStr = queryStr
    }

// product.find(), keyword = shirt, category = electronics

    search(){
        const keyword = this.queryStr.keyword ? {
            title : {
                $regex : this.queryStr.keyword,
                $options : "i"
            }
        } : {}

        this.query = this.query.find({...keyword});
        return this
    }

    filter(){
        const queryStrCopy = {...this.queryStr};
        console.log(queryStrCopy);
        const removeItems = ["keyword", "page", "limit"];
        removeItems.forEach(item => delete queryStrCopy[item]);
        console.log(queryStrCopy);
        this.query = this.query.find(queryStrCopy);
        return this
        
    }

    // category = "electronics", "dressing"

    pagination(){
        let productsPerPage = 15;
        const currentPage = this.queryStr.page || 1
        const skip = productsPerPage * (currentPage - 1);
        this.query = this.query.limit(productsPerPage).skip(skip);
        return this
    }
}

export default ApiFeatures



// page = 1
// 5 * ( 1 - 1 ) = 0
// 5 * ( 2 - 1 ) = 5