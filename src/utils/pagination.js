import * as dbService from "../db/db.service.js";

export const paginate = async ({
  page,
  limit,
  model,
  populate = [],
  filter = {},
  select = "",
}) => {
  page = parseInt(page < 1 || limit == null ? process.env.PAGE : page);
  limit = parseInt(limit < 1 || limit == null ? process.env.LIMIT : limit);
  const skip = (page - 1) * limit;

  const count = await model.find(filter).countDocuments();
  const data = await dbService.find({
    model,
    filter,
    populate,
    limit,
    skip,
  });

  return { data, page, limit, count };
};
