import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";

export const imageTypeResponse = new GraphQLObjectType({
  name: "attachmentsResponse",
  fields: {
    secure_url: { type: GraphQLString },
    public_id: { type: GraphQLString },
  },
});

export const onePostResponse = new GraphQLObjectType({
  name: "onePostResponse",
  fields: {
    _id: { type: GraphQLID },
    content: { type: GraphQLString },
    attachments: {
      type: new GraphQLList(imageTypeResponse),
    },
    likes: {
      type: new GraphQLList(
        new GraphQLObjectType({
          name: "likes",
          fields: {
            _id: { type: GraphQLID },
          },
        })
      ),
    },
    tags: {
      type: new GraphQLList(
        new GraphQLObjectType({
          name: "tags",
          fields: {
            _id: { type: GraphQLID },
          },
        })
      ),
    },
    createdBy: {
      type: new GraphQLObjectType({
        name: "createdBy",
        fields: {
          _id: { type: GraphQLID },
        },
      }),
    },
    updatedBy: {
      type: new GraphQLObjectType({
        name: "updatedBy",
        fields: {
          _id: { type: GraphQLID },
        },
      }),
    },
    deletedBy: {
      type: new GraphQLObjectType({
        name: "deletedBy",
        fields: {
          _id: { type: GraphQLID },
        },
      }),
    },
    isDeleted: {
      type: GraphQLBoolean,
    },
  },
});

export const postListResponse = new GraphQLObjectType({
  name: "postListResponse",
  fields: {
    message: { type: GraphQLString },
    statusCode: { type: GraphQLInt },
    data: {
      type: new GraphQLList(onePostResponse),
    },
  },
});
