class ApiFeatures {
  constructor(queryArgs, queryStr) {
    this.queryArgs = queryArgs;
    this.queryStr = queryStr;
  }

  search() {
    const keyword = this.queryStr.keyword;
    if (keyword) {
      this.queryArgs.where = {
        ...this.queryArgs.where,
        title: { contains: keyword, mode: "insensitive" },
      };
    }
    return this;
  }

  filter() {
    const queryStrCopy = { ...this.queryStr };
    const removeItems = ["keyword", "page", "limit"];
    removeItems.forEach((item) => delete queryStrCopy[item]);
    const opMap = { gte: "gte", lte: "lte", gt: "gt", lt: "lt" };

    Object.entries(queryStrCopy).forEach(([key, value]) => {
      const bracketMatch = key.match(/^(\w+)\[(\w+)\]$/);
      if (bracketMatch) {
        const [, field, op] = bracketMatch;
        if (opMap[op]) {
          this.queryArgs.where = {
            ...this.queryArgs.where,
            [field]: { ...this.queryArgs.where[field], [opMap[op]]: Number(value) },
          };
        }
      } else if (typeof value === "object" && !Array.isArray(value)) {
        const prismaFilter = {};
        Object.entries(value).forEach(([op, val]) => {
          if (opMap[op]) {
            prismaFilter[opMap[op]] = Number(val);
          }
        });
        if (Object.keys(prismaFilter).length) {
          this.queryArgs.where = { ...this.queryArgs.where, [key]: prismaFilter };
        }
      } else if (typeof value === "string") {
        this.queryArgs.where = { ...this.queryArgs.where, [key]: { contains: value, mode: "insensitive" } };
      } else {
        this.queryArgs.where = { ...this.queryArgs.where, [key]: value };
      }
    });

    return this;
  }

  pagination() {
    const productsPerPage = 15;
    const currentPage = Number(this.queryStr.page) || 1;
    this.queryArgs.skip = productsPerPage * (currentPage - 1);
    this.queryArgs.take = productsPerPage;
    return this;
  }
}

export default ApiFeatures;
