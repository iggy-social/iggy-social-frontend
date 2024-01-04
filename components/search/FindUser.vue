<template>
  <div>
    <div class="input-group mb-3">
      <input 
        type="text" 
        class="form-control text-end" 
        placeholder="enter name" 
        aria-describedby="find-user"
        v-model="domainName"
        v-on:keyup.enter="redirectToProfile"
      >
      <span class="input-group-text" id="find-user">{{$config.tldName}}</span>
    </div>

    <p v-if="domainNotValid.invalid && domainNotValid.message" class="text-danger">
      <small>
        <i class="bi bi-exclamation-octagon"></i> {{ domainNotValid.message }}
      </small>
    </p>

    <div class="text-center">
      <button class="btn btn-primary mt-2 mb-2" :disabled="domainNotValid.invalid" @click="redirectToProfile">
        Find User
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "FindUser",
  emit: ["closeModal"],

  data() {
    return {
      domainName: null
    }
  },

  computed: {
    domainNotValid() {
      if (this.domainName === "") {
        return {invalid: true, message: null};
      } else if (this.domainName === null) {
        return {invalid: true, message: null};
      } else if (this.domainName.includes(".")) {
        return {invalid: true, message: "Dots not allowed"};
      } else if (this.domainName.includes(" ")) {
        return {invalid: true, message: "Spaces not allowed"};
      } else if (this.domainName.includes("%")) {
        return {invalid: true, message: "% not allowed"};
      } else if (this.domainName.includes("&")) {
        return {invalid: true, message: "& not allowed"};
      } else if (this.domainName.includes("?")) {
        return {invalid: true, message: "? not allowed"};
      } else if (this.domainName.includes("#")) {
        return {invalid: true, message: "# not allowed"};
      } else if (this.domainName.includes("/")) {
        return {invalid: true, message: "/ not allowed"};
      } else if (this.domainName.includes(",")) {
        return {invalid: true, message: "Comma not allowed"};
      } else if (
        this.domainName.includes("\\") || 
        this.domainName.includes("­") || 
        this.domainName.includes("	") || 
        this.domainName.includes("͏") || 
        this.domainName.includes("؜") || 
        this.domainName.includes("܏") || 
        this.domainName.includes("ᅟ") || 
        this.domainName.includes("ᅠ") || 
        this.domainName.includes(" ") || 
        this.domainName.includes("឴") || 
        this.domainName.includes("឵") || 
        this.domainName.includes("᠎") || 
        this.domainName.includes(" ") || 
        this.domainName.includes(" ") || 
        this.domainName.includes(" ") || 
        this.domainName.includes(" ") || 
        this.domainName.includes(" ") || 
        this.domainName.includes(" ") || 
        this.domainName.includes(" ") || 
        this.domainName.includes(" ") || 
        this.domainName.includes(" ") || 
        this.domainName.includes(" ") || 
        this.domainName.includes(" ") || 
        this.domainName.includes("​") || 
        this.domainName.includes("‌") || 
        this.domainName.includes("‍") || 
        this.domainName.includes("‎") || 
        this.domainName.includes("‏") || 
        this.domainName.includes(" ") || 
        this.domainName.includes(" ") || 
        this.domainName.includes("⁠") || 
        this.domainName.includes("⁡") || 
        this.domainName.includes("⁢") || 
        this.domainName.includes("⁣") || 
        this.domainName.includes("⁤") || 
        this.domainName.includes("⁪") || 
        this.domainName.includes("⁫") || 
        this.domainName.includes("⁬") || 
        this.domainName.includes("⁭") || 
        this.domainName.includes("⁮") || 
        this.domainName.includes("⁯") || 
        this.domainName.includes("　") || 
        this.domainName.includes("⠀") || 
        this.domainName.includes("ㅤ") || 
        this.domainName.includes("ﾠ") || 
        this.domainName.includes("𑂱") || 
        this.domainName.includes("𛲠") || 
        this.domainName.includes("𛲡") || 
        this.domainName.includes("𛲢") || 
        this.domainName.includes("𛲣") || 
        this.domainName.includes("𝅙") || 
        this.domainName.includes("𝅳") || 
        this.domainName.includes("𝅴") || 
        this.domainName.includes("𝅵") || 
        this.domainName.includes("𝅶") || 
        this.domainName.includes("𝅷") || 
        this.domainName.includes("𝅸") || 
        this.domainName.includes("𝅹") || 
        this.domainName.includes("𝅺") || 
        this.domainName.includes("") || 
        this.domainName.includes("") || 
        this.domainName.includes("")
      ) {
        return {invalid: true, message: "This character is not allowed"};
      }

      return {invalid: false, message: "Domain name is valid"};
    }, 
  }, 

  methods: {
    redirectToProfile() {
      this.$router.push({ path: '/profile', query: { id: this.domainName + this.$config.tldName } });
      this.$emit("closeModal");
    }
  }
}
</script>