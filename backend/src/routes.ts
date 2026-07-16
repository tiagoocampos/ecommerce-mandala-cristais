import { Request, Response, Router } from 'express';

import multer from 'multer';
import uploadConfig from "./config/multer.js";
import { CreateUserController } from './controllers/user/createUserController.js';
import { createUserSchema, authUserSchema } from './schemas/userSchema.js';
import { AuthUserController } from './controllers/user/AuthUserController.js';
import { DetailUserController } from './controllers/user/DetailUserController.js';
import { isAuthenticated } from './middlewares/IsAuthenticated.js';
import { CreateCategoryController } from './controllers/category/CreateCategoryController.js';
import { isAdmin } from './middlewares/IsAdmin.js';
import { createCategorySchema, updateCategorySchema } from './schemas/categorySchema.js';
import { ListCategoriesController } from './controllers/category/ListCategoriesController.js';
import { CreateProductController } from './controllers/product/CreateProductController.js';
import { CreateProductSchema } from './schemas/productSchema.js';
import { ListProductsController } from './controllers/product/ListProductsController.js';
import { ListProductsSchema } from './schemas/productSchema.js';
import { DeleteProductController } from './controllers/product/DeleteProductController.js';
import { ListProductsByCategoryController } from './controllers/product/ListProductsByCategoryController.js';
import { ListProductsByCategorySchema } from './schemas/productSchema.js';
import { CreateOrderController } from './controllers/order/CreateOrderController.js';
import { AddItemSchema, CreateOrderSchema, DeleteOrderSchema, FinishOrderSchema, RemoveItemSchema, SendOrderSchema } from './schemas/orderSchema.js';
import { ListOrdersController } from './controllers/order/ListOrdersController.js';
import { DetailOrderController } from './controllers/order/DetailOrderController.js';
import { OrderDetailSchema } from './schemas/orderDetailSchema.js';
import { AddItemController } from './controllers/order/AddItemController.js';
import { RemoveItemController } from './controllers/order/RemoveItemController.js';
import { SendOrderController } from './controllers/order/SendOrderController.js';
import { FinishOrderController } from './controllers/order/FinishOrderController.js';
import { DeleteOrderController } from './controllers/order/DeleteOrderController.js';
import { ListUsersAdminController } from './controllers/user/admin/ListUsersAdminController.js';
import { UpdateUserRoleAdminController } from './controllers/user/admin/UpdateUserRoleAdminController.js';
import { DeleteUserAdminController } from './controllers/user/admin/DeleteUserAdminController.js';
import { updateUserRoleParamsSchema, updateUserRoleSchema } from './schemas/userAdminSchema.js';
import { validateSchema } from './middlewares/validateSchema.js';
import { createAddressSchema, deleteAddressSchema, updateAddressSchema } from './schemas/adressSchema.js';
import { CreateAddressController } from './controllers/address/CreateAddressController.js';
import { ListAddressController } from './controllers/address/ListAddressController.js';
import { DeleteAddressController } from './controllers/address/DeleteAddressController.js';
import { UpdateCategoryController } from './controllers/category/UpdateCategoryController.js';
import { UpdateAddressController } from './controllers/address/UpdateAddressController.js';
import { DeleteCategoryController } from './controllers/category/DeleteCategoryController.js';

const router = Router();
const upload = multer(uploadConfig);




router.post("/users", validateSchema(createUserSchema), new CreateUserController().handle)
router.post("/session", validateSchema(authUserSchema), new AuthUserController().handle)
router.get("/me", isAuthenticated, new DetailUserController().handle)

router.get("/category", new ListCategoriesController().handle);
router.post("/category", isAuthenticated, isAdmin, validateSchema(createCategorySchema), new CreateCategoryController().handle);
router.put("/category/:id", isAuthenticated, isAdmin, validateSchema(updateCategorySchema), new UpdateCategoryController().handle);
router.delete("/category/:id", isAuthenticated, isAdmin, new DeleteCategoryController().handle);

router.post("/address", isAuthenticated, validateSchema(createAddressSchema), new CreateAddressController().handle);
router.get("/address", isAuthenticated, new ListAddressController().handle);
router.delete("/address", isAuthenticated, validateSchema(deleteAddressSchema),new DeleteAddressController().handle);
router.put("/address", isAuthenticated, validateSchema(updateAddressSchema), new UpdateAddressController().handle);

router.post("/product", isAuthenticated, isAdmin, upload.single("file"), validateSchema(CreateProductSchema), new CreateProductController().handle);
router.get("/products", isAuthenticated, validateSchema(ListProductsSchema), new ListProductsController().handle)
router.get("/category/product", isAuthenticated, validateSchema(ListProductsByCategorySchema), new ListProductsByCategoryController().handle);
router.delete("/product", isAuthenticated, isAdmin, new DeleteProductController().handle)

router.post("/order", isAuthenticated, validateSchema(CreateOrderSchema), new CreateOrderController().handle)
router.get("/orders", isAuthenticated, new ListOrdersController().handle)
router.get("/order/detail", isAuthenticated, validateSchema(OrderDetailSchema), new DetailOrderController().handle)
router.post("/order/add",  isAuthenticated, validateSchema(AddItemSchema),new AddItemController().handle)
router.delete("/order/remove", isAuthenticated, validateSchema(RemoveItemSchema), new RemoveItemController().handle)
router.put("/order/send", isAuthenticated, validateSchema(SendOrderSchema),new SendOrderController().handle)
router.put("/order/finish", isAuthenticated, validateSchema(FinishOrderSchema),new FinishOrderController().handle)
router.delete("/order", isAuthenticated, validateSchema(DeleteOrderSchema),new DeleteOrderController().handle)
router.get("/admin/users", isAuthenticated, isAdmin, new ListUsersAdminController().handle)
router.put("/admin/users/:id", isAuthenticated, isAdmin, validateSchema(updateUserRoleParamsSchema), validateSchema(updateUserRoleSchema), new UpdateUserRoleAdminController().handle)
router.delete("/admin/users/:id", isAuthenticated, isAdmin, validateSchema(updateUserRoleParamsSchema), new DeleteUserAdminController().handle)

export { router };



