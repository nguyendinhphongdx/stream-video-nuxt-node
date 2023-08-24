<template>
    <div>
        <div class="container">
            <div v-for="(video, id) in videoList" :key="id" class="vid-con">
                <video preload="metadata" >
                   
                </video>
            </div>
        </div>
    </div>
</template>
    
<script>
export default {
    props: ['videoList'],
    data() {
        return {
            state: {
                current: 0,
                next: 1,
            }
        }
    },
    mounted() {
        
    }
}
</script>
<style scoped>
.container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    margin-top: 2rem;
    gap: 20px;
}

.vid-con {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    justify-content: center;
    width: 50%;
    margin: auto 2em;

}

.vid {
    height: 15rem;
    width: 100%;
    background-position: center;
    background-size: cover;
}

.movie-info {
    background: black;
    color: white;
    width: 100%;
}

.details {
    padding: 16px 20px;
}
</style>