class ApiFeatures {
  constructor(mongooseQuery, queryString) {
    ((this.mongooseQuery = mongooseQuery), (this.queryString = queryString));
  }
  filter() {
    const queryStringObj = {...this.queryString};
    const excludesFields = ["page", "sort", "limit", "fields", "keyword"];
    excludesFields.forEach((field) => delete queryStringObj[field]);
    // Apply filtering using [gte,gt,lte,lt]=>مشروح في الورق
    let queryStr = JSON.stringify(queryStringObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      // console.log(req.query.sort);
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
      // console.log(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort("-createdAt");
    }
    return this;
  }
  limitFields() {
    if (this.queryString.fields) {
      // title,ratingsAverage,imageCover,price
      const fields = this.queryString.fields.split(",").join(" ");
      // title ratingsAverage imageCover price
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select("-__v");
    }
    return this;
  }
  search(modelName) {
    if (this.queryString.keyword) {
      let query = {};
      if (modelName === "Products") {
        query.$or = [
          {title: {$regex: this.queryString.keyword, $options: "i"}}, //mens = MENS
          {description: {$regex: this.queryString.keyword, $options: "i"}},
        ];
      } else {
        query = {name: {$regex: this.queryString.keyword, $options: "i"}};
      }
      this.mongooseQuery = this.mongooseQuery.find(query);
    }
    return this;
  }
  paginate(countDocuments) {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;
    const endIndex = page * limit;
    // اخر دوكيومينت في الصفحة

    // Pagination Result
    const pagination = {};
    pagination.currentPage = page;
    pagination.limit = limit;
    pagination.numberOfPages = Math.ceil(countDocuments / limit); // 50/10 = 0.2 هنخليها واحد صحيح ceilباستخدام
    // next page
    if (endIndex < countDocuments) {
      pagination.next = page + 1;
    }
    // previous page
    if (skip > 0) {
      pagination.prev = page - 1;
    }

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    this.paginationResult = pagination;
    // يعني الاوبجيكت اللي راجع من ال apiFeature
    // ضيف ليه خانة جديدة اسمها paginationResult
    // قيمتها = الاوبجيكت اللي عملناه فوق
    // "pagination" اللي هو
    return this;
  }
}

//-------END
//-------
//-------
//-------
//-------
// -----------------
/**
ليه بنعمل return this; في نهاية كل method؟

بص على الكلاس اللي عندك ApiFeatures، هو معمول علشان تطبق أكتر من عملية على نفس الـ query (filter, sort, paginate … إلخ).

لما تكتب:

return this;


المعنى: بعد ما تخلص تنفيذ الميثود، رجّع نفس الـ object الحالي.
وده بيسمح لك تعمل chaining (سلسلة استدعاءات).

 مش بيرجع الـ constructor نفسه ككود  لكن بيرجع الـ object اللي اتبنى بالـ constructor.

مثال عملي من كودك:

const apiFeatures = new ApiFeatures(Product.find(), req.query)
  .filter()
  .sort();


لو مفيش return this;، الاستدعاء هيقف عند أول ميثود:

.filter()  // بيرجع undefined
.sort()    // مش هيشتغل لإنه بيحاول يشتغل على undefined


لكن لما تعمل return this;:

.filter() بيرجع نفس object ApiFeatures

فتقدر تكمل بـ .sort() بعده

وهكذا تعمل سلسلة (chaining).
 */

module.exports = ApiFeatures;
