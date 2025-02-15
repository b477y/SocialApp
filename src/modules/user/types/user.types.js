import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import { imageType } from "../../../utils/app.types.shared.js";

export const oneUserType = {
  _id: { type: GraphQLID },
  username: { type: GraphQLString },
  email: { type: GraphQLString },
  temporaryEmail: { type: GraphQLString },
  temporaryEmailOTP: { type: GraphQLString },
  confirmEmailOTP: { type: GraphQLString },
  resetPasswordOTP: { type: GraphQLString },
  otpCreatedAt: { type: GraphQLString },
  otpAttempts: { type: GraphQLInt },
  password: { type: GraphQLString },
  phoneNumber: { type: GraphQLString },
  address: { type: GraphQLString },
  DOB: { type: GraphQLString },
  image: { type: imageType },
  coverImages: { type: new GraphQLList(imageType) },
  gender: {
    type: new GraphQLEnumType({
      name: "genderTypes",
      values: {
        Male: { type: GraphQLString },
        Female: { type: GraphQLString },
      },
    }),
  },
  role: {
    type: new GraphQLEnumType({
      name: "roleTypes",
      values: {
        User: { type: GraphQLString },
        Admin: { type: GraphQLString },
        SuperAdmin: { type: GraphQLString },
      },
    }),
  },
  confirmEmail: { type: GraphQLBoolean },
  isDeleted: { type: GraphQLBoolean },
  provider: {
    type: new GraphQLEnumType({
      name: "providerTypes",
      values: {
        Google: { type: GraphQLString },
        System: { type: GraphQLString },
      },
    }),
  },
  changeCredentialsTime: { type: GraphQLString },
  updatedBy: { type: GraphQLID },
  createdAt: { type: GraphQLString },
  updatedAt: { type: GraphQLString },
};

export const oneUserResponse = new GraphQLObjectType({
  name: "oneUserResponse",
  fields: {
    ...oneUserType,
    viewers: {
      type: new GraphQLList(
        new GraphQLObjectType({
          name: "viewersList",
          fields: {
            ...oneUserType,
          },
        })
      ),
    },
  },
});
