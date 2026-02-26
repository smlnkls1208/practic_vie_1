let eventBus = new Vue()

Vue.component('product-review', {
    template: `

<form class="review-form" @submit.prevent="onSubmit">

 <p>
   <label for="name">Name:</label>
   <input id="name" v-model="name" placeholder="name" @blur="errors.name = !name">
   <span v-if="errors.name" class="error">Name is required</span>
 </p>

 <p>
   <label for="review">Review:</label>
   <textarea id="review" v-model="review" @blur="errors.review = !review"></textarea>
   <span v-if="errors.review" class="error">Review is required</span>
 </p>

 <p>
   <label for="rating">Rating:</label>
   <select id="rating" v-model.number="rating" @blur="errors.rating = !rating"
   >
     <option>5</option>
     <option>4</option>
     <option>3</option>
     <option>2</option>
     <option>1</option>
   </select>
   <span v-if="errors.rating" class="error">Rating is required</span>
 </p>

 <p>
   <input type="submit" value="Submit"> 
 </p>

</form>
 `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            errors: {
                name: false,
                review: false,
                rating: false
            }
        }
    },
    methods: {
        onSubmit() {
            this.errors.name = !this.name;
            this.errors.review = !this.review;
            this.errors.rating = !this.rating;
            if (this.name && this.review && this.rating) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating
                }
                eventBus.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null
                this.errors = {name: false, review: false, rating: false}
            }
        }
    }
})

Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `
   <div class="product">
    <div class="product-image">
           <img :src="image" :alt="altText"/>
       </div>

       <div class="product-info">
           <h1>{{ title }}</h1>
           <p v-if="inStock">In stock</p>
           <p v-else>Out of Stock</p>
           <ul>
               <li v-for="detail in details">{{ detail }}</li>
           </ul>
          <p>Shipping: {{ shipping }}</p>
           <div
                   class="color-box"
                   v-for="(variant, index) in variants"
                   :key="variant.variantId"
                   :style="{ backgroundColor:variant.variantColor }"
                   @mouseover="updateProduct(index)"
           ></div>
          
           <button
                   v-on:click="addToCart"
                   :disabled="!inStock"
                   :class="{ disabledButton: !inStock }"
           >
               Add to cart
           </button>    
       </div>           
       <div>
             <product-tabs 
           :reviews="reviews" 
           :shipping="shipping" 
           :details="details"
       ></product-tabs>
       </div>
 `,

    data() {
        return {
            product: "Socks",
            brand: 'Vue Mastery',
            selectedVariant: 0,
            altText: "A pair of socks",
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: "./assets/vmSocks-green-onWhite.jpg",
                    variantQuantity: 10
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                    variantQuantity: 0
                }
            ],
            reviews: []
        }
    },
    methods: {
        addToCart() {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId);
        },
        updateProduct(index) {
            this.selectedVariant = index;
            console.log(index);

        },
    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
        })
    },

    computed: {
        title() {
            return this.brand + ' ' + this.product;
        },
        image() {
            return this.variants[this.selectedVariant].variantImage;
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity
        },
        shipping() {
            if (this.premium) {
                return "Free";
            } else {
                return 2.99
            }
        }
    },

})

Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: false
        },
        shipping: {
            type: String,
            required: false
        },
        details: {
            type: Array,
            required: false
        }
    },

    template: `
     <div>   
       <ul>
         <span class="tab"
               :class="{ activeTab: selectedTab === tab }"
               v-for="(tab, index) in tabs"
               @click="selectedTab = tab"
         >{{ tab }}</span>
       </ul>
       
       <div v-show="selectedTab === 'Reviews'">
         <p v-if="!reviews.length">There are no reviews yet.</p>
         <div v-else>
            <select v-model="selectedRating">
                <option value="all">All</option>
                <option value="5">5</option>
                <option value="4">4</option>
                <option value="3">3</option>
                <option value="2">2</option>
                <option value="1">1</option>
            </select>
            <ul>
              <li v-for="(review, index) in filteredReviews" :key="index">
                <p>{{ review.name }}</p>
                <p>Rating: {{ review.rating }}</p>
                <p>{{ review.review }}</p>
              </li>
            </ul>
          </div>
        </div>
       
       <div v-show="selectedTab === 'Make a Review'">
         <product-review></product-review>
       </div>
       
       <div v-show="selectedTab === 'Shipping'">
         <p>{{ shipping }}</p>
       </div>
       
       <div v-show="selectedTab === 'Details'">
         <ul>
           <li v-for="(detail, index) in details" :key="index">{{ detail }}</li>
         </ul>
       </div>
       
     </div>
 `,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review'],
            tabs: ['Reviews', 'Make a Review', 'Shipping', 'Details'],
            selectedTab: 'Reviews',
            selectedRating: 'all'
        }
    },
    computed: {
        filteredReviews() {
            if (this.selectedRating === 'all') {
                return this.reviews;
            }
            return this.reviews.filter(review => review.rating == this.selectedRating);
        }
    }
})



let app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: []
    },
    methods: {
        updateCart(id) {
            this.cart.push(id);
        }
    }
})
