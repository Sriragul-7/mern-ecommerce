import {create} from "zustand"
import axios from "../lib/axios.js"
import {toast} from "react-hot-toast"


export const useUserStore = create((set,get) => ({
    user:null,
    loading:false,
    checkingAuth:true,

    signup: async ({name,email,password,confirmPassword}) =>{
        set({loading:true});

        if(password != confirmPassword){
            set({loading:false})
            return toast.error("Password do not match")
        }

        try {
            const res= await axios.post("/auth/signup", {name, email, password})
            set({ user:res.data.user, loading:false });
            toast.success("Account Created")
        } catch (error) {
            set({loading:false});
            toast.error(error.response?.data?.message || error.message)
        }
    },

    login: async ({ email, password }) => {
  set({ loading: true });

  try {
    const res = await axios.post("/auth/login", { email, password });
    set({ user: res.data});
    console.log("user :",res.data)
    toast.success("Logged in successfully");
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
  } finally {
    set({ loading: false });
  }
    },

    logout:  async()=>{
      try {
        await axios.post("/auth/logout");
        set({user:null})
      } catch (error) {
        toast.error(error.response?.data?.message || error.message)
      }
    },

    checkAuth: async()=>{
        set({checkingAuth:true});

        try {
            const response = await axios.get("/auth/profile");
            set({user: response.data.user || response.data, checkingAuth: false})
        } catch (error) {
            set({checkingAuth: false , user:null})
        }
    },
   refreshToken: async()=>{
    if(get().checkingAuth) return;

    set({checkingAuth: true});
    try {
      const response = await axios.post("/auth/refresh-token");
      set({checkingAuth: false});
      return response.data
    } catch (error) {
      set({user: null, checkingAuth: false});
      throw error;
    }
   } 

}))


// Axios version

// const res= await axios.post("/auth/signup", {name, email, password})
// set({ user:res.data.user, loading:false });



// Normal verion

// const res = await fetch("/auth/signup", {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json"
//   },
//   body: JSON.stringify({ name, email, password })
// });

// const data = await res.json();

// set({ user: data.user, loading: false });
