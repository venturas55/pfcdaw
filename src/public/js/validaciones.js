
var checkPass = function() {
    if (document.getElementById('password').value ==
      document.getElementById('confirmPassword').value) {
      document.getElementById('message').style.color = 'green';
      document.getElementById('message').innerHTML = 'passwords matching';
      document.getElementById('btn-setpass').classList.remove('disabled');
  
    } else {
      document.getElementById('message').style.color = 'red';
      document.getElementById('confirmPassword').style.color = 'red'
      document.getElementById('message').innerHTML = 'Please make sure your passwords match';
      console.log("hago disabled");
      document.getElementById('btn-setpass').classList.add('disabled');
    }
  }

  $(".inputpassvalidate").on("keyup", checkPass);
