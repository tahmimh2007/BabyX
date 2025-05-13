# BabyX
# Roster:
**PM:** Tahmim Hassan

**Devo 1:** Vedant Kothari

**Devo 2:** Benjamin Rudinski

**Devo 3:** Yinwei Zhang

# Project Description:

At a school like Stuyvesant, it’s fair to say academic rigor is at the forefront of our expectations. Exams and quizzes take up a big proportion of one’s time. One thing we’ve all learned is that the key to studying is studying with quantity rather than quality. Oftentimes, we are forced to cram studying in a short time due to accumulation of other things. Our goal is to fix this issue. We want to provide a centralized location for students to find resources. They can do anything study-related on this site, from finding study guides for the most challenging courses (physics, chemistry, calc, etc.), a free-to-use whiteboard for students to write work out, and practice quizzes with data visualization features.

# Install Guide

**Prerequisites**

Ensure that **Git** and **Python** are installed on your machine. It is recommended that you use a virtual machine when running this project to avoid any possible conflicts. For help, refer to the following documentation:
   1. Installing Git: https://git-scm.com/book/en/v2/Getting-Started-Installing-Git 
   2. Installing Python: https://www.python.org/downloads/ 

   3. (Optional) Setting up Git with SSH (Ms. Novillo's APCSA Guide): https://novillo-cs.github.io/apcsa/tools/ 
         

**Cloning the Project**
1. Create Python virtual environment:

```
$ python3 -m PATH/TO/venv_name
```

2. Activate virtual environment 

   - Linux: `$ . PATH/TO/venv_name/bin/activate`
   - Windows (PowerShell): `> . .\PATH\TO\venv_name\Scripts\activate`
   - Windows (Command Prompt): `>PATH\TO\venv_name\Scripts\activate`
   - macOS: `$ source PATH/TO/venv_name/bin/activate`

   *Notes*

   - If successful, command line will display name of virtual environment: `(venv_name) $ `

   - To close a virtual environment, simply type `$ deactivate` in the terminal


3. In terminal, clone the repository to your local machine: 

HTTPS METHOD (Recommended)

```
$ git clone https://github.com/tahmimh2007/BabyX__tahmimh2_vedantk3_yinweiz_benjaminr143.git    
```

SSH METHOD (Requires SSH Key to be set up):

```
$ git clone git@github.com:tahmimh2007/BabyX__tahmimh2_vedantk3_yinweiz_benjaminr143.git
```

4. Navigate to project directory

```
$ cd PATH/TO/BabyX__tahmimh2_vedantk3_yinweiz_benjaminr143/
```

5. Install dependencies

```
$ pip install -r requirements.txt
```
        
