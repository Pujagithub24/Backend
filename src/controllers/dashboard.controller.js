import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    if(!req.user?._id)
        throw new ApiError(404, "Unauthorized request");

    const userId = req.user?._id;
    const channelStats = await Video.aggregate([
        {
            $match: {
                owner: userId
            }
        },

        //lookup for subscribers of a channel
        {
            $lookup: {
                from: "subscriptions",
                localField: "owner",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        //lookup for the channel which the owner subscribe
        {
            $lookup: {
                from: "subscriptions",
                localField: "owner",
                foreignField: "subscriber",
                as: "subscribedTo",
            },
        },
        //Lookup comments for the user's videos
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "videoComments",
            },
        },
        //lookup tweets by the user
        {
            $lookup: {
                from: "tweets",
                localField: "owner",
                foreignField: "owner",
                as: "tweets",
            },
        },

        //group to calculate stats
        {
            $group: {
                _id: null,
                totalVideos: {$sum: 1},
                totalViews: { $sum: "$views" },
                subscribers: { $first: "$subscribers" },
                subscribedTo: { $first: "$subscribedTo" },
                totalLikes: { $sum:  {$size: "$likedVideos"} },
                totalComments: { $sum: { $size: "$videoComments" } },
                totalTweets: { $first: { $size: "$tweets" } },
            },
        },
         // Project the desired fields
         {
            $project: {
              _id: 0,
              totalVideos: 1,
              totalViews: 1,
              subscribers: { $size: "$subscribers" },
              subscribedTo: { $size: "$subscribedTo" },
              totalLikes: 1,
              totalComments: 1,
              totalTweets: 1,
            },
          },

    ]);
   return res 
    .status(200)
    .json(
        new ApiResponse(
            200 , 
            channelStats[0],
            "Channel stats fetched Successfully"
        )
    );
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    if(!req.user?._id)
        throw new ApiError(404 , "Unauthorized request");

    const videos = await Video.find({
        owner: req.user._id
    })

    if(!videos[0]){
        return res.status(200)
        .json(new ApiResponse(200 , [] , "No videos found"))
    }

    return res
    .status(200)
    .json(new ApiResponse(200, videos, "total videos fetched successfully"))
})

export {
    getChannelStats, 
    getChannelVideos
    }