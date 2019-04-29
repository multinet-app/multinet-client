<template>
<button @click="onClick" class="Button">
  <slot>Button</slot>
</button>
</template>
​
<script>
export default {
  props: {
    onClick: {
      type: Function,
      required: true
    }
  }
}
</script>

<style scoped>


.Button {
   color:#648189;
  text-decoration:none;
  -webkit-transition:0.3s all ease;
  transition:0.3s all ease;
  cursor: pointer;
  font-size:13px;
  letter-spacing:1.5px;
  text-transform:uppercase;
  display:inline-block;
  text-align:center;
  font-weight:bold;
  padding:10px 6px;
  border:1.5px solid #648189;
  border-radius:2px;
  position:relative;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06), 0 3px 6px rgba(0,0,0,0.01);
  margin:2px;
}
.Button:hover {
    color:#FFF;
     -webkit-transition:0.5s all ease;
    transition:0.5s all ease;
    background-color:#648189
  }
.Button:focus {
    color:#FFF;
    background-color:#648189;
  }
</style>