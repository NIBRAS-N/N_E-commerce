//small bug from 350 line code,,but result is showing without any problem
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { myCache } from "../app.js";
import { Product } from "../models/products.model.js";
import { User } from "../models/user.model.js";
import { Order } from "../models/order.model.js";
import { calculatePercentage } from "../utils/features.js";
import { getInventories } from "../utils/features.js";
import { getChartData } from "../utils/features.js";
import { myDocument } from "../utils/features.js";

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
    let charts;
    let key = "admin-pie-charts";

    if(myCache.has(key))charts = JSON.parse(myCache.get(key) as string);

    else{
        const allOrderPromises = Order.find({}).select(["total","discount","subtotal","tax","shippingCharges"])

        const[
            processingOrder,
            shippedOrder,
            deliveredOrder,
            categories,
            productsCount,
            outOfStock,
            allOrders,
            allUsers,
            adminUsers,
            customerUsers,
        ] = await Promise.all([
            Order.countDocuments({status:"Processing"}),
            Order.countDocuments({ status: "Shipped"}),
            Order.countDocuments({ status: "Delivered"}),
            Product.distinct("category"),
            Product.countDocuments(),
            Product.countDocuments({ stock: 0 }),
            allOrderPromises,
            User.find({}).select(["dob"]),
            User.countDocuments({ role: "admin" }),
            User.countDocuments({ role: "user" }),
        ])
        console.log("lol",allOrders);
        const orderFullfillment = {
            processing: processingOrder,
            shipped: shippedOrder,
            delivered: deliveredOrder,
        };

        const productCategories = await getInventories({
            categories,
            productsCount,
        });

        const stockAvailablity = {
            inStock: productsCount - outOfStock,
            outOfStock,
        };

        const grossIncome = allOrders.reduce(
            (prev, order) => prev + (order.total || 0),
            0
        );

        const discount = allOrders.reduce(
            (prev, order) => prev + (order.discount || 0),
            0
        );
        
        const productionCost = allOrders.reduce(
            (prev, order) => prev + (order.shippingCharges || 0),
            0
        );

        const burnt = allOrders.reduce((prev, order) => prev + (order.tax || 0), 0);

        const marketingCost = Math.round(grossIncome * (30 / 100));

        const netMargin = grossIncome - discount - productionCost - burnt - marketingCost;

        const revenueDistribution = {
            netMargin,
            discount,
            productionCost,
            burnt,
            marketingCost,
        };
  
        const usersAgeGroup = {
            teen: allUsers.filter((i) => i.age < 20).length,
            adult: allUsers.filter((i) => i.age >= 20 && i.age < 40).length,
            old: allUsers.filter((i) => i.age >= 40).length,
        };

        const adminCustomer = {
            admin: adminUsers,
            customer: customerUsers,
        };

        charts = {
            orderFullfillment,
            productCategories,
            stockAvailablity,
            revenueDistribution,
            usersAgeGroup,
            adminCustomer,
        };

        myCache.set(key, JSON.stringify(charts));
    }

    return res.status(200).json(new ApiResponse(200,charts,"All date for pie charts have been fetched"));
})


const getBarCharts  = asyncHandler(async(req,res)=>{
    let charts;
    const key = "admin-bar-charts";

    if (myCache.has(key)) charts = JSON.parse(myCache.get(key) as string);
    else{

        const today = new Date();

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const sixMonthProductPromise = Product.find({
            createdAt: {
              $gte: sixMonthsAgo,
              $lte: today,
            },
            }).select("createdAt");
      
        const sixMonthUsersPromise = User.find({
            createdAt: {
              $gte: sixMonthsAgo,
              $lte: today,
            },
        }).select("createdAt");

        const twelveMonthOrdersPromise = Order.find({
            createdAt: {
              $gte: twelveMonthsAgo,
              $lte: today,
            },
          }).select("createdAt");

        const [sixMonthProduct , sixMontUsers , twelveMonthOrders] = await Promise.all([sixMonthProductPromise,sixMonthUsersPromise ,twelveMonthOrdersPromise])

        // const sixMonthProductList = new Array(sixMonthProduct.length).fill(0);
        // const sixMontUsersList = new Array(sixMontUsers.length).fill(0);
        // const twelveMonthOrdersList = new Array(sixMontUsers.length).fill(0);

        // const sixMonthProduct_string_id= sixMonthProduct.map((user)=>({...user,_id:user._id.toString()}));
        //   console.log("lol",sixMonthProduct_string_id[0]._doc,sixMonthProduct);

        //   iSSUES: WHEN _iD IS OBJECT-iD, ITS SHOWING ERROR,, BUT RESULT IS COMING
        
        const productCounts = getChartData({ length: 6,  docArr: sixMonthProduct ,today });
        const usersCounts = getChartData({ length: 6, today, docArr: sixMontUsers });
        const ordersCounts = getChartData({ length: 12, today, docArr: twelveMonthOrders });

        charts = {
            users: usersCounts,
            products: productCounts,
            orders: ordersCounts,
        };
        
        myCache.set(key, JSON.stringify(charts));
    }
    return res.status(200).json(new ApiResponse(200,charts,"All date for bar charts have been fetched"));
})

const getLineCharts = asyncHandler(async(req,res)=>{
    let charts;
    const key = "admin-line-charts";

    if (myCache.has(key)) charts = JSON.parse(myCache.get(key) as string);
    else{
        const today = new Date();

        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        
        const baseQuery = {
            createdAt: {
              $gte: twelveMonthsAgo,
              $lte: today,
            },
        };
      
        const [products, users, orders] = await Promise.all([
            Product.find(baseQuery).select("createdAt"),
            User.find(baseQuery).select("createdAt"),
            Order.find(baseQuery).select(["createdAt", "discount", "total"]),
        ]);
        

        const productCounts = getChartData({ length: 12, today, docArr: products });
        const usersCounts = getChartData({ length: 12, today, docArr: users });
        const discount = getChartData({
          length: 12,
          today,
          docArr: orders,
          property: "discount",
        });
        const revenue = getChartData({
          length: 12,
          today,
          docArr: orders,
          property: "total",
        });
    
        charts = {
          users: usersCounts,
          products: productCounts,
          discount,
          revenue,
        };
    
        myCache.set(key, JSON.stringify(charts));
    
    }
    return res.status(200).json(new ApiResponse(200,charts,"All date for admin line charts have been fetched"));
})

export {getDeshboardStats,getBarCharts,getLineCharts,getPieCharts};