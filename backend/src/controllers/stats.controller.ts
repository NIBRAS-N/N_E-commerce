import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { myCache } from "../app.js";
import { Product } from "../models/products.model.js";
import { User } from "../models/user.model.js";
import { Order } from "../models/order.model.js";
import { calculatePercentage } from "../utils/features.js";
import { getInventories } from "../utils/features.js";
const getDeshboardStats = asyncHandler(async(req,res)=>{
    let stats;

    const key = "admin-stats";

    if(myCache.has("admin-stats"))stats = JSON.parse(myCache.get("admin-stats")as string);
    else{
        const today = new Date();

        const sixMonthsAgo = new Date();

        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth()-6);

        const thisMonth  = {
            start : new Date(today.getFullYear(),today.getMonth(),1),
            end : today
        }
        const lastMonth = {
            start : new Date(today.getFullYear(),today.getMonth()-1,1),
            end : new Date(today.getFullYear(),today.getMonth(),0),
        }
        const thisMonthProductsPromise = Product.find({
            createdAt: {
              $gte: thisMonth.start,
              $lte: thisMonth.end,
            },
          });
      
        const lastMonthProductsPromise = Product.find({
            createdAt: {
              $gte: lastMonth.start,
              $lte: lastMonth.end,
            },
        });
          
        const thisMonthUsersPromise = User.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end,
            },
        });
  
        const lastMonthUsersPromise = User.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end,
            },
        });
  
        const thisMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end,
            },
        });
        const lastMonthOrdersPromise = Order.find({
            createdAt: {
              $gte: lastMonth.start,
              $lte: lastMonth.end,
            },
        });

        const lastSixMonthOrdersPromise = Order.find({
            createdAt: {
              $gte: sixMonthsAgo,
              $lte: today,
            },
        });
      
        const latestTransactionsPromise = Order.find({})
            .select(["orderItems", "discount", "total", "status"])
            .limit(4);

            const [
                thisMonthProducts,
                thisMonthUsers,
                thisMonthOrders,
                lastMonthProducts,
                lastMonthUsers,
                lastMonthOrders,
                productsCount,
                usersCount,
                allOrders,
                lastSixMonthOrders,
                categories,
                femaleUsersCount,
                latestTransaction,
            ] = await Promise.all([
                thisMonthProductsPromise,
                thisMonthUsersPromise,
                thisMonthOrdersPromise,
                lastMonthProductsPromise,
                lastMonthUsersPromise,
                lastMonthOrdersPromise,
                Product.countDocuments(),
                User.countDocuments(),
                Order.find({}).select("total"),
                lastSixMonthOrdersPromise,
                Product.distinct("category"),
                User.countDocuments({ gender: "female" }),
                latestTransactionsPromise,
        ]);

        
        const thisMonthRevenue = thisMonthOrders.reduce(
            (accumulator,currentValue)=>(accumulator+(currentValue.total||0)),0
        )

        const lastMontRevenue = lastMonthOrders.reduce(
            (accumulator,currentValue)=>(accumulator+(currentValue.total||0)),0
        )

        const changePercent = {
            user:calculatePercentage(thisMonthUsers.length,lastMonthUsers.length),
            order : calculatePercentage(thisMonthOrders.length,lastMonthOrders.length),

            revenue: calculatePercentage(thisMonthRevenue,lastMontRevenue),
            product:calculatePercentage(thisMonthProducts.length,lastMonthProducts.length)

        }

        const revenue = allOrders.reduce((accumulator,currentValue)=>(accumulator+(currentValue.total||0)),0)

        const count = {
            revenue,
            product:productsCount,
            user:usersCount,
            order:allOrders.length
        }

        const orderOfLastSixMonthCounts = new Array(6).fill(0);
        const orderOfLastSixMonthRevenue = new Array(6).fill(0);

        lastSixMonthOrders.forEach(order=>{
            const creationDate = order.createdAt;
            const monthDiff = (today.getMonth()-creationDate.getMonth()+12)%12;

            if(monthDiff<6){
                orderOfLastSixMonthCounts[6- monthDiff -1 ]+=1;
                orderOfLastSixMonthRevenue[6-monthDiff-1]+=order.total;
            }
        })
        const categoryCount = await getInventories({
            categories,
            productsCount,
        });
        // const categoriesCountPromise1 = Product.countDocuments({category:"electronics"})
        // const categoriesCountPromise2 = Product.countDocuments({category:"Toys"})
        // const lol = await Promise.all([categoriesCountPromise1,categoriesCountPromise2]);
        // console.log(lol);

        // console.log(categoryCount);

        const userRatio = {
            male: usersCount - femaleUsersCount,
            female: femaleUsersCount,
        };
      
        const modifiedLatestTransaction = latestTransaction.map((i) => ({
            _id: i._id,
            discount: i.discount,
            amount: i.total,
            quantity: i.orderItems.length,
            status: i.status,
        }));

        stats = {
            categoryCount,
            changePercent,
            count,
            chart: {
              order: orderOfLastSixMonthCounts,
              revenue: orderOfLastSixMonthRevenue,
            },
            userRatio,
            latestTransaction: modifiedLatestTransaction,
        };
        myCache.set(key, JSON.stringify(stats));

    }
    res.status(200).json(new ApiResponse(200,stats,"All necesary data to show on dashboard have been fetched"));
})
const getPieCharts  = asyncHandler(async(req,res)=>{

})
const getBarCharts  = asyncHandler(async(req,res)=>{

})
const getLineCharts    = asyncHandler(async(req,res)=>{

})

export {getDeshboardStats,getBarCharts,getLineCharts,getPieCharts};